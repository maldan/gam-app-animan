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

type RepoApi struct {
}

func (r RepoApi) GetIndex(args struct {
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

func (r RepoApi) GetList(args struct {
	Category string `json:"category"`
}) []core.ObjectInfo {
	list := make([]core.ObjectInfo, 0)
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

	return list
}

func (r RepoApi) PutPreview(args struct {
	Name     string         `json:"name"`
	Category string         `json:"category"`
	Preview  rapi_core.File `json:"preview"`
}) {
	err := cmhp_file.Write(core.DataDir+"/object/"+args.Category+"/"+args.Name+"/preview.jpg", args.Preview.Data)
	rapi_core.FatalIfError(err)
}

func (r RepoApi) PutIndex(args struct {
	Name  string         `json:"name"`
	Type  string         `json:"type"`
	Model rapi_core.File `json:"model"`
}) {
	if args.Name == "" {
		rapi_core.Fatal(rapi_core.Error{Description: "Incorrect Name"})
	}
	err := cmhp_file.Write(fmt.Sprintf("%v/object/%v/%v/model.glb", core.DataDir, args.Type, args.Name), args.Model.Data)
	rapi_core.FatalIfError(err)
}
