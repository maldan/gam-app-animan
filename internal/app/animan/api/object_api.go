package api

import (
	"fmt"
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-cmhp/cmhp_file"
	"github.com/maldan/go-rapi/rapi_core"
)

type ObjectApi struct {
}

/*func (r ObjectApi) GetIndex(args core.ObjectInfo) core.ObjectInfo {
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
		info.FilePath = strings.Replace(
			strings.Replace(strings.ReplaceAll(file.FullPath, "/info.json", "/model.gltf"), wd, "", 1),
			"/db",
			"data",
			1,
		)

		cmhp_file.ReadJSON(file.FullPath, &info)

		if info.ResourceId == args.ResourceId {
			return info
		}
	}

	rapi_core.Fatal(rapi_core.Error{Description: "File not found", Code: 404})

	return obj
}*/

func (r ObjectApi) GetFile(ctx *rapi_core.Context, args ArgsName) string {
	ctx.IsServeFile = true
	return core.DataDir + "/object/" + args.Name + "/object.gltf"
}

func (r ObjectApi) GetList() []core.ResourceInfo {
	/*list := make([]core.ObjectInfo, 0)

	fileList, _ := cmhp_file.ListAll(core.DataDir + "/object")
	fileList = cmhp_slice.Filter(fileList, func(t cmhp_file.FileInfo) bool {
		return strings.Contains(t.Name, ".gltf")
	})

	for _, file := range fileList {
		fileDir := strings.Replace(file.FullPath, "/model.gltf", "", 1)

		// Get file info
		objectInfo, err := r.GetObjectInfo(fileDir)
		if err != nil {
			r.UpdateObjectInfo(fileDir)
			objectInfo, err = r.GetObjectInfo(fileDir)
		}

		// Add to list
		list = append(list, objectInfo)
	}

	return list*/
	return core.GetResourceList(core.DataDir+"/object", "object", "gltf")
}

func (r ObjectApi) PutPreview(args struct {
	Name    string         `json:"name"`
	Preview rapi_core.File `json:"preview"`
}) {
	err := cmhp_file.Write(core.DataDir+"/object/"+args.Name+"/preview.jpg", args.Preview.Data)
	rapi_core.FatalIfError(err)

	info, err := core.GetResourceInfo(core.DataDir + "/object/" + args.Name)
	if err == nil {
		info.PreviewPath = core.DataDir + "/object/" + args.Name + "/preview.jpg"
		cmhp_file.Write(core.DataDir+"/object/"+args.Name+"/info.json", &info)
	}
}

// GetObjectInfo get some info
/*func (r ObjectApi) GetObjectInfo(pathDir string) (core.ObjectInfo, error) {
	// Open file info
	info := core.ObjectInfo{}
	err := cmhp_file.ReadJSON(pathDir+"/info.json", &info)
	if err != nil {
		return info, err
	}
	return info, nil
}*/

// GetInfo of audio files
func (r ObjectApi) GetInfo(args ArgsResourceId) core.ResourceInfo {
	info, err := core.GetResourceInfoById(core.DataDir+"/object", args.ResourceId, "object", "gltf")
	rapi_core.FatalIfError(err)
	return info
}

// UpdateObjectInfo write some info
/*func (r ObjectApi) UpdateObjectInfo(pathDir string) {
	// Open file info
	info := core.ObjectInfo{}
	cmhp_file.ReadJSON(pathDir+"/info.json", &info)

	if info.ResourceId == "" {
		info.ResourceId = cmhp_crypto.UID(12)
	}

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
	info.FilePath = strings.Replace(strings.Replace(pathDir, wd, "", 1), "/db", "db", 1) + "/model.gltf"

	// Write back
	cmhp_file.Write(pathDir+"/info.json", &info)
}*/

func (r ObjectApi) PutIndex(args struct {
	Name  string         `json:"name"`
	Model rapi_core.File `json:"model"`
}) core.ResourceInfo {
	if args.Name == "" {
		rapi_core.Fatal(rapi_core.Error{Description: "Incorrect Name"})
	}
	err := cmhp_file.Write(fmt.Sprintf("%v/object/%v/object.gltf", core.DataDir, args.Name), args.Model.Data)
	rapi_core.FatalIfError(err)

	// Update file info
	core.UpdateResourceInfo(fmt.Sprintf("%v/object/%v", core.DataDir, args.Name), "object", "gltf")

	// Get info
	info, err := core.GetResourceInfo(core.DataDir + "/object/" + args.Name)
	rapi_core.FatalIfError(err)

	return info
}
