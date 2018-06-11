currentWeekNumber = require('current-week-number');


function get_schedule_duration(start_time, end_time){
  // The diference between times is given in milliseconds. We are expecting hours,
  //so wu divide by 3600000.0 that is the number of milliseconds in 1 hour
  return duration = (end_time - start_time)/3600000.0
}
module.exports = function api(options){

  this.add('role:api,path:createSchedule', function(msg,respond){
    if (msg.args.body == {}){
      message.body.error = 'Nenhum parametro informado';
    }
    var sector_id = msg.args.body.sector_id
    var profile_id = msg.args.body.profile_id
    var start_time = new Date(msg.args.body.start_time)
    var end_time = new Date(msg.args.body.end_time)
    var result = {};

    //valida campos
    console.log("1");
    console.log(start_time);
    if (start_time == "") {
      result.start_time_error = 'O horário de inicio não pode ser vazio';
      console.log(result.start_time_error);
    }
    console.log("2");
    console.log(end_time);
    if (end_time == "") {
      result.end_time_error = 'O horário de término não pode ser vazio';
      console.log(result.end_time_error);
    }
    console.log("3");
    console.log(start_time);
    if (start_time == null) {
      result.start_time_error = 'Horário inicial inválido';
      console.log(result.start_time_error);
    }
    if (start_time == "Invalid Date") {
      result.start_time_error = 'Horário inicial inválido';
      console.log(result.start_time_error);
    }
    console.log("4");
    console.log(end_time);
    if (end_time == null) {
      result.end_time_error = 'Horário final inválido';
      console.log(result.end_time_error);
    }
    if (end_time == "Invalid Date") {
      result.end_time_error = 'Horário final inválido';
      console.log(result.end_time_error);
    }
    console.log("5");
    console.log(sector_id);
    if (sector_id == null || sector_id == "") {
      result.sector_id_error = 'O setor é obrigatório.';
      console.log(result.sector_id_error);
    }
    console.log("6");
    console.log(profile_id);
    if (profile_id == null || profile_id == "") {
      result.profile_id_error = 'O usuário é obrigatório.';
      console.log(result.profile_id_error);
    }
    console.log("7");
    console.log(profile_id);
    if (Array.isArray(profile_id)) {
      result.profile_id_array_error = 'Só é permitido um perfil de usuário.';
      console.log(result.profile_id_array_error);
    }
    console.log("8");
    console.log(sector_id);
    if (Array.isArray(sector_id)) {
      result.multiple_sector_id_error = 'Só é permitido um setor';
      console.log(result.multiple_sector_id_error);
    }
    console.log("9");
    if (Object.entries(result)[0]) {
      console.log("*********************** Resultado com erro: ***********************");
      console.log(result);
      console.log("*********************** Fim do Resultado com erro: ***********************");
      result.success = false;
      respond(null, result)
    } else {
      console.log("10");
      this.act('role:schedule,cmd:createSchedule',{
        start_time:start_time,
        end_time:end_time,
        sector_id:sector_id,
        profile_id:profile_id
      }, respond)
    }
  });


  this.add('role:api,path:createScheduleSettings', function(msg, respond){
    var max_hours_month = msg.args.body.max_hours_month
    var max_hours_week = msg.args.body.max_hours_week
    var min_hours_month = msg.args.body.min_hours_month
    var min_hours_week = msg.args.body.min_hours_week
    // Lista de ids de templates
    var templates = msg.args.body.templates

    this.act('role:schedule,cmd:createScheduleSettings',{
      max_hours_month:max_hours_month,
      max_hours_week:max_hours_week,
      min_hours_month:min_hours_month,
      min_hours_week:min_hours_week,
      templates:templates
    }, respond)
  });

    // this.add('role:api,path:listSchedule', function(msg, respond){
    //   this.act('role:schedule, cmd:listSchedule',{}, respond)
    //
    // });

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
    this.add('role:api,path:listYear', function (msg, respond) {
        console.log(msg.args)
        var currentDate = new Date();
        var year = msg.args.query.year;
        if (year == undefined) {
            year = currentDate.getFullYear();
            year = parseInt(year);
        }
        start_year= new Date(year, 0, 1);
        end_year= new Date((year+1), 0, 1);

        console.log("Start" + start_year)
        console.log("End" + end_year)

        var profile_id = msg.args.query.profile_id;
        this.act('role:schedule,cmd:listYear', {
            start_year:start_year,
            end_year:end_year,
            profile_id:profile_id
        }, respond)
    });

    this.add('role:api,path:listByProfile', function (msg, respond) {
      var id = msg.args.query.id
      console.log("id informado:" + id);
      this.act('role:schedule, cmd:listByProfile', {
        id:id
      }, respond)
    });


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
                    createSchedule: {
                      POST: true
                    },
                    // listDay: {
                    //     GET: true,
                    //     auth: {
                    //         strategy: 'jwt',
                    //         fail: '/api/schedule/error'
                    //     }
                    // },
                    listByProfile: {
                      GET: true
                    },
                    listYear: {
                      GET: true
                    },
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
                    createScheduleSettings: {
                      POST:true
                    },
                    error: {GET: true }
                }
            }
        }, respond)
    })
}
