package core

type Vector3 struct {
	X float32 `json:"x"`
	Y float32 `json:"y"`
	Z float32 `json:"z"`
}

type Quaternion struct {
	X float32 `json:"x"`
	Y float32 `json:"y"`
	Z float32 `json:"z"`
	W float32 `json:"w"`
}

type AnimationKey struct {
	Name        string     `json:"name"`
	Type        uint8      `json:"type"`
	VBool       bool       `json:"vBool"`
	VFloat      float32    `json:"vFloat"`
	VVector2    Vector3    `json:"vVector2"`
	VVector3    Vector3    `json:"vVector3"`
	VQuaternion Quaternion `json:"vQuaternion"`
}

type AnimationFrame struct {
	Keys []AnimationKey `json:"keys"`
}

type AnimationSequence struct {
	Version    uint8            `json:"version"`
	FrameCount uint32           `json:"frameCount"`
	FPS        uint8            `json:"fps"`
	Name       string           `json:"name"`
	Frames     []AnimationFrame `json:"frames"`
}

type ObjectInfo struct {
	UUID        string `json:"uuid"`
	Name        string `json:"name"`
	Category    string `json:"category"`
	PreviewPath string `json:"previewPath"`
	ModelPath   string `json:"modelPath"`
}

type AudioInfo struct {
	UUID      string `json:"uuid"`
	Name      string `json:"name"`
	Category  string `json:"category"`
	AudioPath string `json:"audioPath"`
}

const ANIMATION_SECTION_MARKET uint32 = 1296649793

var DataDir = ""
