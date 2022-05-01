package api

import (
	"encoding/json"
	"fmt"
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-cmhp/cmhp_data"
	"github.com/maldan/go-cmhp/cmhp_file"
	"github.com/maldan/go-rapi/rapi_core"
)

type AnimationApi struct {
}

func (r AnimationApi) GetIndex(args ArgsName) core.AnimationSequence {
	stream, err := cmhp_data.FromFile(core.DataDir+"/animation/"+args.Name+"/animation.ka", true)
	rapi_core.FatalIfError(err)

	animation := core.ReadAnimation(stream)
	animation.Name = args.Name

	return animation
}

func (r AnimationApi) GetFile(ctx *rapi_core.Context, args ArgsName) string {
	ctx.IsServeFile = true
	return core.DataDir + "/animation/" + args.Name + "/animation.ka"
}

func (r AnimationApi) GetList() []core.ResourceInfo {
	return core.GetResourceList(core.DataDir+"/animation", "animation", "ka")
}

func (r AnimationApi) GetInfo(args ArgsResourceId) core.ResourceInfo {
	info, err := core.GetResourceInfoById(core.DataDir+"/animation", args.ResourceId, ".ka", "animation")
	rapi_core.FatalIfError(err)
	return info
}

func (r AnimationApi) PutIndex(args ArgsData) core.ResourceInfo {
	// Unpack data
	animation := core.AnimationSequence{}
	err := json.Unmarshal([]byte(args.Data), &animation)
	rapi_core.FatalIfError(err)

	// Write animation data
	stream := cmhp_data.Allocate(0, true)
	core.WriteAnimationFileInfo(stream, animation)
	core.WriteAnimationFrames(stream, animation)
	core.WriteEnd(stream)

	// Write to file
	err = cmhp_file.Write(core.DataDir+"/animation/"+animation.Name+"/animation.ka", stream.Data)
	rapi_core.FatalIfError(err)

	// Update info
	core.UpdateResourceInfo(fmt.Sprintf("%v/animation/%v", core.DataDir, animation.Name), "animation", "ka")

	// Get info
	info, err := core.GetResourceInfo(core.DataDir + "/animation/" + animation.Name)
	rapi_core.FatalIfError(err)

	return info
}
