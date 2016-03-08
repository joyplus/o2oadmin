package test

import (
	"o2oadmin/models"
	"testing"
)

func TestGetMember(t *testing.T) {

	memberVo := models.GetMember(1)
	t.Log(memberVo)
}
