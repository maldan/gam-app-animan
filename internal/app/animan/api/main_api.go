package api

type MainApi struct {
}

func (r MainApi) GetIndex(args ArgsEmpty) string {
	return "Test"
}
