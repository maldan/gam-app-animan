package api

import (
	"fmt"
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-cmhp/cmhp_file"
	"github.com/maldan/go-rapi/rapi_core"
)

type ObjectApi struct {
}

func (r ObjectApi) GetList(args struct {
	Category string `json:"category"`
}) []core.VirtualObject {
	list := make([]core.VirtualObject, 0)
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

		list = append(list, core.VirtualObject{
			Name:        file.Name(),
			Category:    args.Category,
			ModelPath:   "data/object/" + args.Category + "/" + file.Name() + "/model.glb",
			PreviewPath: previewPath,
		})
	}

	return list
}

func (r ObjectApi) PutPreview(args struct {
	Name     string         `json:"name"`
	Category string         `json:"category"`
	Preview  rapi_core.File `json:"preview"`
}) {
	err := cmhp_file.Write(core.DataDir+"/object/"+args.Category+"/"+args.Name+"/preview.jpg", args.Preview.Data)
	rapi_core.FatalIfError(err)
}

func (r ObjectApi) PutIndex(args struct {
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
