package api

type MainApi struct {
}

func (r MainApi) GetIndex() string {
	return "Test"
}
