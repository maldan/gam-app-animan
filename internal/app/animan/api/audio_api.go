package api

import (
	"fmt"
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-cmhp/cmhp_file"
	"github.com/maldan/go-rapi/rapi_core"
)

type AudioApi struct {
}

func (r AudioApi) GetFile(ctx *rapi_core.Context, args ArgsName) string {
	ctx.IsServeFile = true
	return core.DataDir + "/audio/" + args.Name + "/sound.mp3"
}

// GetList of audio files
func (r AudioApi) GetList() []core.ResourceInfo {
	return core.GetResourceList(core.DataDir+"/audio", "audio", "mp3")
}

// GetInfo get audio file info
func (r AudioApi) GetInfo(args ArgsResourceId) core.ResourceInfo {
	info, err := core.GetResourceInfoById(core.DataDir+"/audio", args.ResourceId, "audio", "mp3")
	rapi_core.FatalIfError(err)
	return info
}

// PutIndex write audio file
func (r AudioApi) PutIndex(args struct {
	Name  string         `json:"name"`
	Audio rapi_core.File `json:"audio"`
}) core.ResourceInfo {
	if args.Name == "" {
		rapi_core.Fatal(rapi_core.Error{Description: "Incorrect Name"})
	}
	err := cmhp_file.Write(fmt.Sprintf("%v/audio/%v/sound.mp3", core.DataDir, args.Name), args.Audio.Data)
	rapi_core.FatalIfError(err)

	// Update info
	core.UpdateResourceInfo(fmt.Sprintf("%v/audio/%v", core.DataDir, args.Name), "audio", "mp3")

	// Get info
	info, err := core.GetResourceInfo(core.DataDir + "/audio/" + args.Name)
	rapi_core.FatalIfError(err)

	return info
}
