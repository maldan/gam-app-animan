package api

import (
	"fmt"
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-cmhp/cmhp_file"
	"github.com/maldan/go-rapi/rapi_core"
)

type ObjectApi struct {
}

func (r ObjectApi) GetList() []core.VirtualObject {
	list := make([]core.VirtualObject, 0)

	fileList, _ := cmhp_file.List(core.DataDir + "/object")

	for _, file := range fileList {
		if !file.IsDir() {
			continue
		}

		// Preview
		previewPath := ""
		if cmhp_file.Exists(core.DataDir + "/object/" + file.Name() + "/preview.jpg") {
			previewPath = "data/object/" + file.Name() + "/preview.jpg"
		}

		list = append(list, core.VirtualObject{
			Name:        file.Name(),
			ModelPath:   "data/object/" + file.Name() + "/model.fbx",
			PreviewPath: previewPath,
		})
	}

	return list
}

func (r ObjectApi) PutPreview(args ArgsObjectPreview) {
	err := cmhp_file.Write(core.DataDir+"/object/"+args.Name+"/preview.jpg", args.Preview.Data)
	rapi_core.FatalIfError(err)
}

func (r ObjectApi) PutIndex(args ArgsObject) {
	if args.Name == "" {
		rapi_core.Fatal(rapi_core.Error{Description: "Incorrect Name"})
	}
	err := cmhp_file.Write(fmt.Sprintf("%v/object/%v/model.fbx", core.DataDir, args.Name), args.Model.Data)
	rapi_core.FatalIfError(err)
}
