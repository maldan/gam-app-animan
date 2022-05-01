package core

import (
	"fmt"
	"github.com/maldan/go-cmhp/cmhp_data"
	"github.com/maldan/go-rapi/rapi_core"
)

func WriteAnimationFileInfo(stream *cmhp_data.ByteArray, animation AnimationSequence) {
	fileInfo := cmhp_data.Allocate(0, true)
	fileInfo.WriteUInt8(animation.Version) // Animation version
	fileInfo.WriteUInt8(animation.FPS)     // FPS
	fileInfo.WriteUTF8(animation.Name)     // Name
	stream.WriteSection(ANIMATION_SECTION_MARKET, "INFO", fileInfo)
}

func WriteAnimationFrames(stream *cmhp_data.ByteArray, animation AnimationSequence) {
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
				frameSection.WriteFloat32(key.VVector2.X)
				frameSection.WriteFloat32(key.VVector2.Y)
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
	stream.WriteSection(ANIMATION_SECTION_MARKET, "FRAMES", frameSection)
}

func WriteEnd(stream *cmhp_data.ByteArray) {
	frameSection := cmhp_data.Allocate(0, true)
	stream.WriteSection(ANIMATION_SECTION_MARKET, "END", frameSection)
}

func ReadAnimation(stream *cmhp_data.ByteArray) AnimationSequence {
	animation := AnimationSequence{}

	for {
		sectionName, section, err := stream.ReadSection(ANIMATION_SECTION_MARKET)
		rapi_core.FatalIfError(err)

		switch sectionName {
		case "INFO":
			animation.Version = section.ReadUint8()
			animation.FPS = section.ReadUint8()
			animation.Name = section.ReadUTF8()
			break
		case "FRAMES":
			// Read frames
			animation.FrameCount = section.ReadUint32()
			animation.Frames = make([]AnimationFrame, 0)

			for i := 0; i < int(animation.FrameCount); i++ {
				// Create frame
				frame := AnimationFrame{Keys: make([]AnimationKey, 0)}

				// Read keys of frame
				keysAmount := int(section.ReadUint16())

				for j := 0; j < keysAmount; j++ {
					// Read key
					keyName := section.ReadUTF8()
					keyType := section.ReadUint8()
					key := AnimationKey{
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
		case "END":
			return animation
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
