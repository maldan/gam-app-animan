package core

import "github.com/maldan/go-cmhp/cmhp_data"

func WriteClipObjectList(stream *cmhp_data.ByteArray, objectList []ObjectInfo) {
	chunk := cmhp_data.Allocate(0, true)
	chunk.WriteUInt16(uint16(len(objectList))) // Amount of objects
	for _, obj := range objectList {
		chunk.WriteUTF8(obj.Id)
		chunk.WriteUTF8(obj.ResourceId)
		chunk.WriteUTF8(obj.Name)

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
	stream.WriteSection(ANIMATION_SECTION_MARKET, "OBJECT_LIST", chunk)
}

func WriteClipAnimationList(stream *cmhp_data.ByteArray, animationList []AnimationController) {
	chunk := cmhp_data.Allocate(0, true)
	chunk.WriteUInt16(uint16(len(animationList))) // Amount of animations

	for _, an := range animationList {
		chunk.WriteUTF8(an.ObjectId)                     // Id of object
		chunk.WriteUInt16(uint16(len(an.AnimationList))) // Amount of animation parts

		for _, part := range an.AnimationList {
			chunk.WriteUInt16(part.Offset) // Offset of part
			chunk.WriteUInt16(part.Repeat) // Repeat of part

			// Write animation data
			WriteAnimationFileInfo(chunk, part.Animation)
			WriteAnimationFrames(chunk, part.Animation)
			WriteEnd(chunk)
		}
	}
	stream.WriteSection(ANIMATION_SECTION_MARKET, "ANIMATION_LIST", chunk)
}

func WriteAudioList(stream *cmhp_data.ByteArray, audioList []AudioPart) {
	chunk := cmhp_data.Allocate(0, true)
	chunk.WriteUInt16(uint16(len(audioList))) // Amount of audi

	for _, an := range audioList {
		chunk.WriteUTF8(an.ObjectId)
		chunk.WriteUTF8(an.ResourceId)
		chunk.WriteUInt32(uint32(an.Offset))
		chunk.WriteUInt32(uint32(an.Repeat))
		chunk.WriteFloat32(float32(an.Volume))
	}

	stream.WriteSection(ANIMATION_SECTION_MARKET, "AUDIO_LIST", chunk)
}
