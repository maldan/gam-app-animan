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
	Type     int        `json:"type"`
	Position Vector3    `json:"position"`
	Rotation Quaternion `json:"rotation"`
	Scale    Vector3    `json:"scale"`
	Value    float32    `json:"value"`
}

type AnimationFrame struct {
	Keys map[string]AnimationKey `json:"keys"`
}

type AnimationSequence struct {
	Version    uint8            `json:"version"`
	FrameCount uint32           `json:"frameCount"`
	FPS        uint8            `json:"fps"`
	Frames     []AnimationFrame `json:"frames"`
}

type VirtualObject struct {
	Name        string `json:"name"`
	Category    string `json:"category"`
	PreviewPath string `json:"previewPath"`
	ModelPath   string `json:"modelPath"`
}

const ANIMATION_SECTION_MARKET uint32 = 1296649793

var DataDir = ""
