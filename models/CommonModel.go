package models

type UserData struct {
	UserId        int
	MixType       string
	RoleId        string
	DefaultMixId  int
	MixUserMatrix []*FeMixUserMatrix
}
