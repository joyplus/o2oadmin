package models

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	"o2oadmin/vo"
)

func GetMember(userId int64) (member vo.MemberVo) {
	o := orm.NewOrm()
	err := o.Raw("select member.id as member_id, member.display_name as display_name, member.org_id, org.name as org_name, org.`base_city_id` as `base_city_id` from `fin_org_member` as member left join fin_org as org on member.`org_id`=org.id WHERE user_id = ?", userId).QueryRow(&member)

	if err != nil {
		beego.Error(err.Error())
	}
	return member
}
