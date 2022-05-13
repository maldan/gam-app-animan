package api

import (
	"encoding/json"
	"fmt"
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-cmhp/cmhp_data"
	"github.com/maldan/go-cmhp/cmhp_file"
	"github.com/maldan/go-rapi/rapi_core"
)

type ClipApi struct {
}

// GetInfo of audio files
func (r ClipApi) GetInfo(args ArgsResourceId) core.ResourceInfo {
	info, err := core.GetResourceInfoById(core.DataDir+"/clip", args.ResourceId, "clip", "ac")
	rapi_core.FatalIfError(err)
	return info
}

// GetList of audio files
func (r ClipApi) GetList() []core.ResourceInfo {
	return core.GetResourceList(core.DataDir+"/clip", "clip", "ac")
}

func (r ClipApi) GetFile(ctx *rapi_core.Context, args ArgsName) string {
	ctx.IsServeFile = true
	return core.DataDir + "/clip/" + args.Name + "/clip.ac"
}

func (r ClipApi) GetIndex(args ArgsName) core.Clip {
	stream, err := cmhp_data.FromFile(core.DataDir+"/clip/"+args.Name+"/clip.ac", true)
	rapi_core.FatalIfError(err)

	clip := core.Clip{
		Name:          args.Name,
		ObjectList:    make([]core.SceneObject, 0),
		AnimationList: make([]core.AnimationController, 0),
		AudioList:     make([]core.AudioPart, 0),
	}

	for {
		sectionName, section, err := stream.ReadSection(core.ANIMATION_SECTION_MARKET)
		rapi_core.FatalIfError(err)

		switch sectionName {
		case "OBJECT_LIST":
			amount := section.ReadUint16()
			for i := 0; i < int(amount); i++ {
				obj := core.SceneObject{}
				obj.Id = section.ReadUTF8()
				obj.ResourceId = section.ReadUTF8()
				obj.Kind = section.ReadUTF8()
				obj.Name = section.ReadUTF8()

				// Position
				params := section.ReadUTF8()
				b := map[string]interface{}{}
				json.Unmarshal([]byte(params), &b)
				obj.Params = b

				/*obj.Position.X = section.ReadFloat32()
				obj.Position.Y = section.ReadFloat32()
				obj.Position.Z = section.ReadFloat32()

				// Rotation
				obj.Rotation.X = section.ReadFloat32()
				obj.Rotation.Y = section.ReadFloat32()
				obj.Rotation.Z = section.ReadFloat32()
				obj.Rotation.W = section.ReadFloat32()

				// Scale
				obj.Scale.X = section.ReadFloat32()
				obj.Scale.Y = section.ReadFloat32()
				obj.Scale.Z = section.ReadFloat32()*/

				clip.ObjectList = append(clip.ObjectList, obj)
			}
			break
		case "ANIMATION_LIST":
			amount := section.ReadUint16() // Amount of total animations

			for i := 0; i < int(amount); i++ {
				controller := core.AnimationController{}
				controller.ObjectId = section.ReadUTF8() // UUID of object
				amountOfList := section.ReadUint16()     // Amount of animation parts

				for j := 0; j < int(amountOfList); j++ {
					part := core.AnimationPart{}
					part.Offset = section.ReadUint16()
					part.Repeat = section.ReadUint16()
					part.Animation = core.ReadAnimation(section)
					controller.AnimationList = append(controller.AnimationList, part)
				}

				clip.AnimationList = append(clip.AnimationList, controller)
			}
			break
		case "AUDIO_LIST":
			amount := section.ReadUint16() // Amount of total audio

			for i := 0; i < int(amount); i++ {
				part := core.AudioPart{
					ObjectId:   section.ReadUTF8(),
					ResourceId: section.ReadUTF8(),
					Offset:     int(section.ReadUint32()),
					Repeat:     int(section.ReadUint32()),
					Volume:     float64(section.ReadFloat32()),
				}

				clip.AudioList = append(clip.AudioList, part)
			}

			break
		case "END":
			return clip
		default:
			fmt.Printf("Unknown section %v\n", sectionName)
			rapi_core.Fatal(rapi_core.Error{Description: fmt.Sprintf("Unknown section %v\n", sectionName)})
			break
		}

		if stream.IsEnd() {
			break
		}
	}

	return clip
}

func (r ClipApi) PutIndex(args ArgsData) core.ResourceInfo {
	// Parse data
	clip := core.Clip{}
	err := json.Unmarshal([]byte(args.Data), &clip)
	rapi_core.FatalIfError(err)

	// Write clip data
	stream := cmhp_data.Allocate(0, true)
	core.WriteClipObjectList(stream, clip.ObjectList)
	core.WriteClipAnimationList(stream, clip.AnimationList)
	core.WriteAudioList(stream, clip.AudioList)
	core.WriteEnd(stream)

	// Write to file
	err = cmhp_file.Write(core.DataDir+"/clip/"+clip.Name+"/clip.ac", stream.Data)
	rapi_core.FatalIfError(err)

	// Update info
	core.UpdateResourceInfo(fmt.Sprintf("%v/clip/%v", core.DataDir, clip.Name), "clip", "ac")

	// Get info
	info, err := core.GetResourceInfo(core.DataDir + "/clip/" + clip.Name)
	rapi_core.FatalIfError(err)

	return info
}
