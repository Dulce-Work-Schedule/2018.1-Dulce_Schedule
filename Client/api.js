currentWeekNumber = require('current-week-number');


function get_schedule_duration(schedule){
  // The diference between times is given in milliseconds. We are expecting hours,
  //so wu divide by 3600000.0 that is the number of milliseconds in 1 hour
  return duration = (schedule.end_time - schedule.start_time)/3600000.0
}

module.exports = function api(options){

  this.add('role:api,path:create', function(msg,respond){
    var sector_id = msg.args.body.sector_id
    var profile_id = msg.args.body.profile_id
    var start_time = new Date(msg.args.body.start_time)
    var end_time = new Date(msg.args.body.end_time)

    if(start_time > end_time){
      this.act('role:schedule,cmd:create',{
      }, respond(null, {success:false, message: 'Horários de Inicio e Fim estão em comflito'}))
    }else if(sector_id == null || (sector_id.length < 1)){
      this.act('role:schedule,cmd:create',{
      }, respond(null, {success:false, message: 'Setor não pode ser vazio'}))
    }else{
      this.act('role:schedule,cmd:create',{
        start_time:start_time,
        end_time:end_time,
        sector_id:sector_id,
        profile_id:profile_id
      }, respond)
    }
  })

  // this.add('role:api,path:listSchedule', function(msg, respond){
  //   this.act('role:schedule, cmd:listSchedule',{}, respond)
  //
  // });

  this.add('role:api,path:createScale', function(msg, respond){
    var maximum_hours_month = msg.args.body.maximum_hours_month
    var maximum_hours_week = msg.args.body.maximum_hours_week
    var minimum_hours_month = msg.args.body.minimum_hours_month
    var minimum_hours_week = msg.args.body.minimum_hours_week
    var id = msg.args.query.id
    var schedule_list = []

    this.act('role:schedule,cmd:createScale',{
      maximum_hours_month:maximum_hours_month,
      maximum_hours_week:maximum_hours_week,
      minimum_hours_month:minimum_hours_month,
      minimum_hours_week:minimum_hours_week,
      id:id
    }, respond)
});

    // this.add('role:api,path:listDay', function (msg, respond) {
    //     var currentDate = new Date();
    //     var day = msg.args.query.day;
    //     var month = msg.args.query.month;
    //     if (month == undefined) {
    //         month = currentDate.getMonth() + 1;
    //     } else {
    //         currentDate.setMonth(month);
    //     }
    //     if (day == undefined) {
    //         day = currentDate.getDate() - 1;
    //         day = JSON.stringify(day);
    //     }
    //     var id = msg.args.query.id;
    //     this.act('role:schedule,cmd:listDay', {
    //         day: day,
    //         id: id
    //     }, respond)
    // });

    // this.add('role:api,path:listMonth', function (msg, respond) {
    //     var currentDate = new Date();
    //     var month = msg.args.query.month;
    //     if (month == undefined) {
    //         month = currentDate.getMonth() + 1;
    //         month = JSON.stringify(month);
    //     }
    //
    //     var id = msg.args.query.id;
    //     this.act('role:schedule,cmd:listMonth', {
    //         month: month,
    //         id: id
    //     }, respond)
    // });

    // this.add('role:api,path:listSchedule', function (msg, respond) {
    //     this.act('role:schedule, cmd:listSchedule', {}, respond)
    //
    // });


    // this.add('role:api,path:listWeek', function (msg, respond) {
    //     var currentDate = new Date();
    //     var day = msg.args.query.day;
    //     var month = msg.args.query.month;
    //     var week = msg.args.query.week;
    //     console.log(week);
    //     if (month == undefined) {
    //         month = currentDate.getMonth() + 1;
    //     } else {
    //         currentDate.setMonth(month);
    //     }
    //     if (day == undefined) {
    //         day = currentDate.getDate() - 1;
    //     } else {
    //         currentDate.setDate(day);
    //     }
    //     if (week == undefined) {
    //
    //         var week = currentWeekNumber(currentDate);
    //
    //         week = JSON.stringify(week);
    //
    //     }
    //
    //     var id = msg.args.query.id;
    //
    //     console.log(id);
    //
    //
    //     this.act('role:schedule,cmd:listWeek', {
    //         week: week,
    //         id: id
    //     }, respond)
    // });


    // this.add('role:api,path:listHourWeek', function (msg, respond) {
    //     var currentDate = new Date();
    //     var day = msg.args.query.day;
    //     var month = msg.args.query.month;
    //     var week = msg.args.query.week;
    //     if (month == undefined) {
    //         month = currentDate.getMonth() + 1;
    //     } else {
    //         currentDate.setMonth(month);
    //     }
    //     if (day == undefined) {
    //         day = currentDate.getDate() - 1;
    //     } else {
    //         currentDate.setDate(day);
    //     }
    //     if (week == undefined) {
    //
    //         var week = currentWeekNumber(currentDate);
    //
    //         week = JSON.stringify(week);
    //
    //     }
    //
    //     var id = msg.args.query.id;
    //
    //
    //     this.act('role:schedule,cmd:listHourWeek', {
    //         week: week,
    //         id: id
    //     }, respond)
    // });

    // this.add('role:api,path:listSectorDay', function (msg, respond) {
    //     var day = msg.args.query.day;
    //     var sector_id = msg.args.query.sector_id;
    //     this.act('role:schedule,cmd:listSectorDay', {
    //         day: day,
    //         sector_id: sector_id
    //     }, respond)
    // });

    // this.add('role:api,path:listSectorMonth', function (msg, respond) {
    //     var month = msg.args.query.month;
    //     var sector_id =  msg.args.query.sector_id;
    //     this.act('role:schedule,cmd:listSectorMonth', {
    //         month: month,
    //         sector_id: sector_id
    //     }, respond)
    // });

    // this.add('role:api,path:listSectorWeek', function (msg, respond) {
    //     var currentDate = new Date();
    //     var day = msg.args.query.day;
    //     var month = msg.args.query.month;
    //     var week = msg.args.query.week;
    //     if(day == undefined){
    //         day = currentDate.getDate() - 1;
    //     }else {
    //         currentDate.setDate(day);
    //     }
    //     if(month == undefined){
    //         month = currentDate.getMonth() + 1;
    //     }else{
    //         currentDate.setMonth(month);
    //     }
    //     if(week == undefined){
    //
    //     var week = currentWeekNumber(currentDate);
    //
    //     week = JSON.stringify(week);
    //
    //     }
    //
    //     var sector_id =  msg.args.query.sector_id;
    //
    //
    //     this.act('role:schedule,cmd:listSectorWeek', {
    //         week: week,
    //         sector_id: sector_id
    //     }, respond)
    // });


    this.add('role:api,path:error', function(msg, respond){
        this.act('role:schedule, cmd:error',{}, respond)
    });


    this.add('init:api', function (msg, respond) {
        this.act('role:web', {
            routes: {
                prefix: '/api/schedule',
                pin: 'role:api,path:*',
                map: {
                    create: {
                      POST: true

                    },
                    // listDay: {
                    //     GET: true,
                    //     auth: {
                    //         strategy: 'jwt',
                    //         fail: '/api/schedule/error'
                    //     }
                    // },
                    // listSchedule: {
                    //     GET: true,
                    //     auth: {
                    //         strategy: 'jwt',
                    //         fail: '/api/schedule/error'
                    //     }
                    // },
                    // listMonth: {
                    //     GET: true,
                    //     auth: {
                    //         strategy: 'jwt',
                    //         fail: '/api/schedule/error'
                    //     }
                    // },
                    // listWeek: {
                    //     GET: true,
                    //     auth: {
                    //         strategy: 'jwt',
                    //         fail: '/api/schedule/error'
                    //     }
                    // },
                    // listHourWeek: {
                    //     GET: true,
                    //     auth: {
                    //         strategy: 'jwt',
                    //         fail: '/api/schedule/error'
                    //     }
                    // },
                    // listSectorDay: { GET: true,
                    //   auth: {
                    //      strategy: 'jwt',
                    //      fail: '/api/schedule/error'
                    //    }
                    //  },
                    // listSchedule: { GET: true,
                    //   auth: {
                    //      strategy: 'jwt',
                    //      fail: '/api/schedule/error'
                    //    }
                    //  },
                    // listSectorMonth: { GET: true,
                    //   auth: {
                    //      strategy: 'jwt',
                    //      fail: '/api/schedule/error'
                    //    }
                    //  },
                    //  listSectorWeek: { GET: true,
                    //    auth: {
                    //        strategy: 'jwt',
                    //        fail: '/api/schedule/error'
                    //     }
                    // },
                    createScale: { POST:true,
                                auth: {
                                  strategy: 'jwt',
                                  fail: '/api/schedule/error',
                                }},
                    error: {GET: true }
                }
            }
        }, respond)
    })
}
