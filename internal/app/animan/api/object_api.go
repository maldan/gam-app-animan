package api

import (
	"fmt"
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-cmhp/cmhp_file"
	"github.com/maldan/go-rapi/rapi_core"
)

type ObjectApi struct {
}

func (r ObjectApi) PutIndex(args ArgsObject) {
	if args.Name == "" {
		rapi_core.Fatal(rapi_core.Error{Description: "Incorrect Name"})
	}
	err := cmhp_file.Write(fmt.Sprintf("%v/object/%v/model.fbx", core.DataDir, args.Name), args.Model.Data)
	rapi_core.FatalIfError(err)
}
