
        //hover delete button
        $("#readableWeekTime ul li").hover(
            function() {
                $(this).children(".del").css("display","inline");
            },
            function() {
                $(this).children(".del").css("display","none");
            }
        );
        //some variables
        $weekdays = ["一","二","三","四","五","六","日"];
        $weektimes = ["0:00","0:30","1:00","1:30","2:00","2:30","3:00","3:30","4:00","4:30","5:00","5:30","6:00","6:30","7:00","7:30","8:00","8:30","9:00","9:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00","22:30","23:00","23:30",]
        //following are the part of add&delete time function
        function addTime(week,time){
                $text = $(".readableWeekModel li").clone();
                $test = $text.attr("data-week",$week*1);
                $test = $text.attr("data-time",$time*1);
                $test = $text.find('.del').first().attr("data-week",$week*1);
                $test = $text.find('.del').first().attr("data-time",$time*1);
                $test = $text.find('.readableWeekday').first().text($weekdays[$week*1]);
                $test = $text.find('.readableWeektime1').first().text($weektimes[($time*1)]);
                $test = $text.find('.readableWeektime2').first().text($weektimes[(($time*1)+1)%48]);
                $("#readableWeekTime ul").append($text);
        };
        function removeTime(week,time){
                $("#calendar-body td").each(function(){
                    //alert($(this).attr("data-week"));
                    if($(this).attr("data-week")*1 == $week && $(this).attr("data-time")*1 == $time){
                        $(this).removeClass("chosen");
                    }
                });
                $("#readableWeekTime li").each(function(){
                    //alert($(this).attr("data-week"));
                    if($(this).attr("data-week")*1 == $week && $(this).attr("data-time")*1 == $time){
                        $(this).remove();
                    }
                });

        };
        //following is the part of revoke all 
        function revoke_choose(){
                $("#calendar-body td").each(function(){
                    $(this).removeClass("chosen");
                });
                $("#readableWeekTime li").each(function(){
                    //alert($(this).attr("data-week"));
                    $(this).remove();
                });
        };
        //click functions
        $(".calendar-atom-time").bind("click",function(){
            if($(this).hasClass("chosen")){
                $(this).removeClass("chosen");
                $week = $(this).attr("data-week");
                $time = $(this).attr("data-time");
                removeTime($week,$time);
            }
            else{
                $(this).addClass("chosen");
                $week = $(this).attr("data-week");
                $time = $(this).attr("data-time");
                addTime($week,$time);
            }
        });
        $(".del").bind("click",function(){
                $week = $(this).attr("data-week");
                $time = $(this).attr("data-time");
                removeTime($week*1,$time*1);
        });
        $("#reset").bind("click",function(){
                revoke_choose();
        });
        //output part
        function output(){
        };