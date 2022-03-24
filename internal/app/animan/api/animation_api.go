package api

import (
	"fmt"
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-cmhp/cmhp_data"
	"github.com/maldan/go-rapi/rapi_core"
)

type AnimationApi struct {
}

func WriteFileInfo(stream *cmhp_data.ByteArray, animation core.AnimationSequence) {
	fileInfo := cmhp_data.Allocate(0, true)
	fileInfo.WriteUInt8(animation.Version) // Animation version
	fileInfo.WriteUInt8(animation.FPS)     // FPS
	stream.WriteSection(core.ANIMATION_SECTION_MARKET, "INFO", fileInfo)
}

func WriteFrames(stream *cmhp_data.ByteArray, animation core.AnimationSequence) {
	frameSection := cmhp_data.Allocate(0, true)
	frameSection.WriteUInt32(animation.FrameCount)

	// Write each frame
	for i := 0; i < len(animation.Frames); i++ {
		// Amount of keys
		frameSection.WriteUInt16(uint16(len(animation.Frames[i].Keys)))

		// Write each key
		for keyName, keyValue := range animation.Frames[i].Keys {
			// Key name
			frameSection.WriteUTF8(keyName)

			// Key type
			frameSection.WriteUInt8(uint8(keyValue.Type))

			// Transform key
			if keyValue.Type == 0 {
				// Write position
				frameSection.WriteFloat32(keyValue.Position.X)
				frameSection.WriteFloat32(keyValue.Position.Y)
				frameSection.WriteFloat32(keyValue.Position.Z)

				// Write rotation
				frameSection.WriteFloat32(keyValue.Rotation.X)
				frameSection.WriteFloat32(keyValue.Rotation.Y)
				frameSection.WriteFloat32(keyValue.Rotation.Z)
				frameSection.WriteFloat32(keyValue.Rotation.W)

				// Write scale
				frameSection.WriteFloat32(keyValue.Scale.X)
				frameSection.WriteFloat32(keyValue.Scale.Y)
				frameSection.WriteFloat32(keyValue.Scale.Z)
			}

			// Blend shape key
			if keyValue.Type == 0 {
				frameSection.WriteFloat32(keyValue.Value)
			}
		}
	}
	stream.WriteSection(core.ANIMATION_SECTION_MARKET, "FRAMES", frameSection)
}

func (r AnimationApi) GetIndex(path string) {
	stream, err := cmhp_data.FromFile(path, true)
	rapi_core.FatalIfError(err)

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
				frame := core.AnimationFrame{Keys: map[string]core.AnimationKey{}}

				// Read keys of frame
				keysAmount := int(section.ReadUint16())

				for i := 0; i < keysAmount; i++ {
					// Read key
					keyName := section.ReadUTF8()
					keyType := section.ReadUint8()
					key := core.AnimationKey{}

					if keyType == 0 {
						// Read position
						x := stream.ReadFloat32()
						y := stream.ReadFloat32()
						z := stream.ReadFloat32()
						key.Position = core.Vector3{X: x, Y: y, Z: z}

						// Read rotation
						x = stream.ReadFloat32()
						y = stream.ReadFloat32()
						z = stream.ReadFloat32()
						w := stream.ReadFloat32()
						key.Rotation = core.Quaternion{X: x, Y: y, Z: z, W: w}

						// Read scale
						x = stream.ReadFloat32()
						y = stream.ReadFloat32()
						z = stream.ReadFloat32()
						key.Scale = core.Vector3{X: x, Y: y, Z: z}
					}

					// Set key
					frame.Keys[keyName] = key
				}
			}

			break
		default:
			fmt.Printf("Unknown section %v\n", sectionName)
			break
		}
	}
}

func (r AnimationApi) PostIndex(animation core.AnimationSequence) {
	stream := cmhp_data.Allocate(0, true)

	WriteFileInfo(stream, animation)
	WriteFrames(stream, animation)
}
