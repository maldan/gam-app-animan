package api

import (
	"fmt"
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-cmhp/cmhp_file"
	"github.com/maldan/go-cmhp/cmhp_slice"
	"github.com/maldan/go-rapi/rapi_core"
	"os"
	"strings"
)

type ObjectApi struct {
}

func (r ObjectApi) GetIndex(args struct {
	UUID string `json:"uuid"`
}) core.ObjectInfo {
	obj := core.ObjectInfo{}

	allFiles, _ := cmhp_file.ListAll(core.DataDir + "/object")
	allFiles = cmhp_slice.Filter(allFiles, func(t cmhp_file.FileInfo) bool {
		return strings.Contains(t.FullPath, "info.json")
	})
	wd, _ := os.Getwd()
	wd = strings.ReplaceAll(wd, "\\", "/")

	for _, file := range allFiles {
		info := core.ObjectInfo{}
		info.PreviewPath = strings.Replace(
			strings.Replace(strings.ReplaceAll(file.FullPath, "/info.json", "/preview.jpg"), wd, "", 1),
			"/db",
			"data",
			1,
		)
		info.ModelPath = strings.Replace(
			strings.Replace(strings.ReplaceAll(file.FullPath, "/info.json", "/model.glb"), wd, "", 1),
			"/db",
			"data",
			1,
		)

		cmhp_file.ReadJSON(file.FullPath, &info)

		if info.UUID == args.UUID {
			return info
		}
	}

	rapi_core.Fatal(rapi_core.Error{Description: "File not found", Code: 404})

	return obj
}

func (r ObjectApi) GetList() []core.ObjectInfo {
	list := make([]core.ObjectInfo, 0)

	fileList, _ := cmhp_file.ListAll(core.DataDir + "/object")
	fileList = cmhp_slice.Filter(fileList, func(t cmhp_file.FileInfo) bool {
		return strings.Contains(t.Name, ".glb")
	})

	for _, file := range fileList {
		fileDir := strings.Replace(file.FullPath, "/model.glb", "", 1)

		// Get file info
		objectInfo, err := r.GetObjectInfo(fileDir)
		if err != nil {
			r.UpdateObjectInfo(fileDir)
			objectInfo, err = r.GetObjectInfo(fileDir)
		}

		// Add to list
		list = append(list, objectInfo)
	}

	return list

	/*list := make([]core.ObjectInfo, 0)
	if args.Category == "" {
		return list
	}

	fileList, _ := cmhp_file.List(core.DataDir + "/object/" + args.Category)

	for _, file := range fileList {
		if !file.IsDir() {
			continue
		}

		// Preview
		previewPath := ""
		if cmhp_file.Exists(core.DataDir + "/object/" + args.Category + "/" + file.Name() + "/preview.jpg") {
			previewPath = "data/object/" + args.Category + "/" + file.Name() + "/preview.jpg"
		}

		// Get file info
		fileInfo := core.ObjectInfo{}
		cmhp_file.ReadJSON(core.DataDir+"/object/"+args.Category+"/"+file.Name()+"/info.json", &fileInfo)

		// Add to list
		list = append(list, core.ObjectInfo{
			UUID:        fileInfo.UUID,
			Name:        file.Name(),
			Category:    args.Category,
			ModelPath:   "data/object/" + args.Category + "/" + file.Name() + "/model.glb",
			PreviewPath: previewPath,
		})
	}

	return list*/
}

func (r ObjectApi) PutPreview(args struct {
	Name    string         `json:"name"`
	Preview rapi_core.File `json:"preview"`
}) {
	err := cmhp_file.Write(core.DataDir+"/object/"+args.Name+"/preview.jpg", args.Preview.Data)
	rapi_core.FatalIfError(err)

	info, err := r.GetObjectInfo(core.DataDir + "/object/" + args.Name)
	if err == nil {
		info.PreviewPath = core.DataDir + "/object/" + args.Name + "/preview.jpg"
		cmhp_file.Write(core.DataDir+"/object/"+args.Name+"/info.json", &info)
	}
}

// GetObjectInfo get some info
func (r ObjectApi) GetObjectInfo(pathDir string) (core.ObjectInfo, error) {
	// Open file info
	info := core.ObjectInfo{}
	err := cmhp_file.ReadJSON(pathDir+"/info.json", &info)
	if err != nil {
		return info, err
	}
	return info, nil
}

// UpdateObjectInfo write some info
func (r ObjectApi) UpdateObjectInfo(pathDir string) {
	// Open file info
	info := core.ObjectInfo{}
	cmhp_file.ReadJSON(pathDir+"/info.json", &info)
	info.UUID, _ = cmhp_file.HashSha1(pathDir + "/model.glb")

	// Calculate name
	nameTuple := strings.Split(pathDir, "/")
	info.Name = nameTuple[len(nameTuple)-1]

	// Get working directory
	wd, _ := os.Getwd()
	wd = strings.ReplaceAll(wd, "\\", "/")

	// Calculate category
	categoryTuple := strings.Split(strings.Replace(pathDir, wd+"/db/object/", "", 1), "/")
	info.Category = strings.Join(categoryTuple[0:len(categoryTuple)-1], "/")

	// Audio path
	info.ModelPath = strings.Replace(strings.Replace(pathDir, wd, "", 1), "/db", "db", 1) + "/model.glb"

	// Write back
	cmhp_file.Write(pathDir+"/info.json", &info)
}

func (r ObjectApi) PutIndex(args struct {
	Name  string         `json:"name"`
	Model rapi_core.File `json:"model"`
}) {
	if args.Name == "" {
		rapi_core.Fatal(rapi_core.Error{Description: "Incorrect Name"})
	}
	err := cmhp_file.Write(fmt.Sprintf("%v/object/%v/model.glb", core.DataDir, args.Name), args.Model.Data)
	rapi_core.FatalIfError(err)

	// Update file info
	r.UpdateObjectInfo(fmt.Sprintf("%v/object/%v", core.DataDir, args.Name))
}
