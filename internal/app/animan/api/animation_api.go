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

type AnimationApi struct {
}

func WriteAnimationFileInfo(stream *cmhp_data.ByteArray, animation core.AnimationSequence) {
	fileInfo := cmhp_data.Allocate(0, true)
	fileInfo.WriteUInt8(animation.Version) // Animation version
	fileInfo.WriteUInt8(animation.FPS)     // FPS
	stream.WriteSection(core.ANIMATION_SECTION_MARKET, "INFO", fileInfo)
}

func WriteAnimationFrames(stream *cmhp_data.ByteArray, animation core.AnimationSequence) {
	frameSection := cmhp_data.Allocate(0, true)
	frameSection.WriteUInt32(animation.FrameCount)

	// Write each frame
	for i := 0; i < len(animation.Frames); i++ {
		// Amount of keys
		frameSection.WriteUInt16(uint16(len(animation.Frames[i].Keys)))

		// Write each key
		for _, key := range animation.Frames[i].Keys {
			// Key name
			frameSection.WriteUTF8(key.Name)

			// Key type
			frameSection.WriteUInt8(uint8(key.Type))

			// Bool key
			if key.Type == 0 {
				if key.VBool {
					frameSection.WriteUInt8(1)
				} else {
					frameSection.WriteUInt8(0)
				}
			}

			// Float key
			if key.Type == 1 {
				frameSection.WriteFloat32(key.VFloat)
			}

			// Vector2 key
			if key.Type == 2 {
				frameSection.WriteFloat32(key.VVector3.X)
				frameSection.WriteFloat32(key.VVector3.Y)
			}

			// Vector3 key
			if key.Type == 3 {
				frameSection.WriteFloat32(key.VVector3.X)
				frameSection.WriteFloat32(key.VVector3.Y)
				frameSection.WriteFloat32(key.VVector3.Z)
			}

			// Quaternion key
			if key.Type == 4 {
				frameSection.WriteFloat32(key.VQuaternion.X)
				frameSection.WriteFloat32(key.VQuaternion.Y)
				frameSection.WriteFloat32(key.VQuaternion.Z)
				frameSection.WriteFloat32(key.VQuaternion.W)
			}
		}
	}
	stream.WriteSection(core.ANIMATION_SECTION_MARKET, "FRAMES", frameSection)
}

func ReadAnimation(stream *cmhp_data.ByteArray) core.AnimationSequence {
	animation := core.AnimationSequence{}

	for {
		sectionName, section, err := stream.ReadSection(core.ANIMATION_SECTION_MARKET)
		rapi_core.FatalIfError(err)

		switch sectionName {
		case "INFO":
			animation.Version = section.ReadUint8()
			animation.FPS = section.ReadUint8()
			break
		case "FRAMES":
			// Read frames
			animation.FrameCount = section.ReadUint32()
			animation.Frames = make([]core.AnimationFrame, 0)

			for i := 0; i < int(animation.FrameCount); i++ {
				// Create frame
				frame := core.AnimationFrame{Keys: make([]core.AnimationKey, 0)}

				// Read keys of frame
				keysAmount := int(section.ReadUint16())

				for i := 0; i < keysAmount; i++ {
					// Read key
					keyName := section.ReadUTF8()
					keyType := section.ReadUint8()
					key := core.AnimationKey{
						Name: keyName,
						Type: keyType,
					}

					// Bool key
					if keyType == 0 {
						x := section.ReadUint8()
						if x == 1 {
							key.VBool = true
						} else {
							key.VBool = false
						}
					}

					// Float key
					if keyType == 1 {
						key.VFloat = section.ReadFloat32()
					}

					// Vector2 key
					if keyType == 2 {
						key.VVector2.X = section.ReadFloat32()
						key.VVector2.Y = section.ReadFloat32()
					}

					// Vector3 key
					if keyType == 3 {
						key.VVector3.X = section.ReadFloat32()
						key.VVector3.Y = section.ReadFloat32()
						key.VVector3.Z = section.ReadFloat32()
					}

					// Quaternion key
					if keyType == 4 {
						key.VQuaternion.X = section.ReadFloat32()
						key.VQuaternion.Y = section.ReadFloat32()
						key.VQuaternion.Z = section.ReadFloat32()
						key.VQuaternion.W = section.ReadFloat32()
					}

					frame.Keys = append(frame.Keys, key)
				}

				animation.Frames = append(animation.Frames, frame)
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

	return animation
}

func (r AnimationApi) GetIndex(args ArgsAnimationName) core.AnimationSequence {
	stream, err := cmhp_data.FromFile(core.DataDir+"/animation/"+args.Name+".ka", true)
	rapi_core.FatalIfError(err)

	animation := ReadAnimation(stream)
	animation.Name = args.Name

	return animation
}

func (r AnimationApi) GetList() []string {
	list := make([]string, 0)

	fileList, _ := cmhp_file.ListAll(core.DataDir + "/animation")
	fileList = cmhp_slice.Filter(fileList, func(t cmhp_file.FileInfo) bool {
		return strings.Contains(t.Name, ".ka")
	})

	// Get working directory
	wd, _ := os.Getwd()
	wd = strings.ReplaceAll(wd, "\\", "/")

	for _, file := range fileList {
		// Add to list
		list = append(
			list,
			strings.Replace(
				strings.Replace(strings.Replace(file.FullPath, ".ka", "", 1), wd, "", 1), "/db/animation/", "", 1,
			),
		)
	}

	return list
}

func (r AnimationApi) PutIndex(args struct {
	Animation string `json:"animation"`
}) {
	animation := core.AnimationSequence{}
	json.Unmarshal([]byte(args.Animation), &animation)

	// Write animation data
	stream := cmhp_data.Allocate(0, true)
	WriteAnimationFileInfo(stream, animation)
	WriteAnimationFrames(stream, animation)

	// Animation
	err := cmhp_file.Write(core.DataDir+"/animation/"+animation.Name+".ka", stream.Data)
	rapi_core.FatalIfError(err)
}
