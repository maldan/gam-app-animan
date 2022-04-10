package api

import (
	"encoding/json"
	"fmt"
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-cmhp/cmhp_data"
	"github.com/maldan/go-cmhp/cmhp_file"
	"github.com/maldan/go-cmhp/cmhp_slice"
	"github.com/maldan/go-rapi/rapi_core"
	"os"
	"strings"
)

type ClipApi struct {
}

func WriteClipObjectList(stream *cmhp_data.ByteArray, objectList []core.ObjectInfo) {
	chunk := cmhp_data.Allocate(0, true)
	chunk.WriteUInt16(uint16(len(objectList))) // Amount of objects
	for _, obj := range objectList {
		chunk.WriteUTF8(obj.UUID)

		// Position
		chunk.WriteFloat32(obj.Position.X)
		chunk.WriteFloat32(obj.Position.Y)
		chunk.WriteFloat32(obj.Position.Z)

		// Rotation
		chunk.WriteFloat32(obj.Rotation.X)
		chunk.WriteFloat32(obj.Rotation.Y)
		chunk.WriteFloat32(obj.Rotation.Z)
		chunk.WriteFloat32(obj.Rotation.W)

		// Scale
		chunk.WriteFloat32(obj.Scale.X)
		chunk.WriteFloat32(obj.Scale.Y)
		chunk.WriteFloat32(obj.Scale.Z)
	}
	stream.WriteSection(core.ANIMATION_SECTION_MARKET, "OBJECT_LIST", chunk)
}

func WriteClipAnimationList(stream *cmhp_data.ByteArray, animationList []core.AnimationController) {
	chunk := cmhp_data.Allocate(0, true)
	chunk.WriteUInt16(uint16(len(animationList))) // Amount of animations

	for _, an := range animationList {
		chunk.WriteUTF8(an.ObjectUUID)                   // UUID of object
		chunk.WriteUInt16(uint16(len(an.AnimationList))) // Amount of animation parts

		for _, part := range an.AnimationList {
			chunk.WriteUInt16(part.Offset) // Offset of part

			// Write animation data
			WriteAnimationFileInfo(chunk, part.Animation)
			WriteAnimationFrames(chunk, part.Animation)
		}
	}
	stream.WriteSection(core.ANIMATION_SECTION_MARKET, "ANIMATION_LIST", chunk)
}

func (r ClipApi) GetList() []string {
	list := make([]string, 0)

	fileList, _ := cmhp_file.ListAll(core.DataDir + "/clip")
	fileList = cmhp_slice.Filter(fileList, func(t cmhp_file.FileInfo) bool {
		return strings.Contains(t.Name, ".ac")
	})

	// Get working directory
	wd, _ := os.Getwd()
	wd = strings.ReplaceAll(wd, "\\", "/")

	for _, file := range fileList {
		// Add to list
		list = append(
			list,
			strings.Replace(
				strings.Replace(strings.Replace(file.FullPath, ".ac", "", 1), wd, "", 1), "/db/clip/", "", 1,
			),
		)
	}

	return list
}

func (r ClipApi) GetIndex(args ArgsName) core.Clip {
	stream, err := cmhp_data.FromFile(core.DataDir+"/clip/"+args.Name+".ac", true)
	rapi_core.FatalIfError(err)

	clip := core.Clip{
		Name: args.Name,
	}

	for {
		sectionName, section, err := stream.ReadSection(core.ANIMATION_SECTION_MARKET)
		rapi_core.FatalIfError(err)

		switch sectionName {
		case "OBJECT_LIST":
			amount := section.ReadUint16()
			for i := 0; i < int(amount); i++ {
				obj := core.ObjectInfo{}
				obj.UUID = section.ReadUTF8()

				// Position
				obj.Position.X = section.ReadFloat32()
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
				obj.Scale.Z = section.ReadFloat32()

				clip.ObjectList = append(clip.ObjectList, obj)
			}
			break
		case "ANIMATION_LIST":
			amount := section.ReadUint16() // Amount of total animations
			for i := 0; i < int(amount); i++ {
				controller := core.AnimationController{}
				controller.ObjectUUID = section.ReadUTF8() // UUID of object
				amountOfList := section.ReadUint16()       // Amount of animation parts

				for j := 0; j < int(amountOfList); j++ {
					part := core.AnimationPart{}
					part.Offset = section.ReadUint16()
					part.Animation = ReadAnimation(section)
					controller.AnimationList = append(controller.AnimationList, part)
				}

				clip.AnimationList = append(clip.AnimationList, controller)
			}
			break
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

func (r ClipApi) PutIndex(args struct {
	Clip string `json:"clip"`
}) {
	clip := core.Clip{}
	json.Unmarshal([]byte(args.Clip), &clip)

	// Write clip data
	stream := cmhp_data.Allocate(0, true)
	WriteClipObjectList(stream, clip.ObjectList)
	WriteClipAnimationList(stream, clip.AnimationList)

	// Animation
	err := cmhp_file.Write(core.DataDir+"/clip/"+clip.Name+".ac", stream.Data)
	rapi_core.FatalIfError(err)
}
