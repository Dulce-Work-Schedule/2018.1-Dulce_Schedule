module.exports = function(options){
    var schedule_db = 'schedules'
    this.add('role:schedule,cmd:createSchedule', function create (msg,respond) {
    var schedule = this.make(schedule_db)
    schedule.start_time = msg.start_time
    schedule.end_time = msg.end_time
    schedule.sector_id = msg.sector_id
    schedule.profile_id = msg.profile_id

    //valida campos
    if (schedule.start_time == null || schedule.start_time == "") {
      respond(null, {success:false, message: 'O horário de inicio não pode ser vazio'})
    } else if (schedule.end_time == null || schedule.end_time == "") {
      respond(null, {success:false, message: 'O horário de término não pode ser vazio'})
    } else if (schedule.sector_id == null || schedule.sector_id == "") {
      respond(null, {success:false, message: 'O horário de inicio não pode ser vazio'})
    } else if (schedule.profile_id == null || schedule.profile_id == "") {
      respond(null, {success:false, message: 'O horário de inicio não pode ser vazio'})
    }

    // validar apenas mongo object IDs no caso do profile e do sector

    // Valida inicio menor que fim
    if( (schedule.start_time - schedule.start_time) < 0 ){
      respond(null, {success:false, message: 'O fim do horário deve ser maior que o início do horário.'})
    }else if( (schedule.start_time - schedule.start_time) == 0 ){
      respond(null, {success:false, message: 'O horário de início e de fim não podem ser iguais.'})
    }

    //valida se profile e sector não são arrays

    // Valida se não tem conflito de horário
    schedule.list$(
      {
        start_time: {
          $gte: schedule.start_time,
          $lt: schedule.end_time
        },
        end_time: {
          $lte: schedule.end_time,
          $gt: schedule.start_time
        },
        profile_id: schedule.profile_id,
        sector_id: schedule.sector_id
      },
      function(err,list){
        list.forEach(function(time){
          console.log("entra no for each do horario")
            if (schedule.start_time >= time.start_time && schedule.start_time <= time.end_time) {
              respond(null, {success:false, message: 'Plantonista já possui um horário de '+ time.start_time + ' à ' + time.end_time + '.'})
            }else if (schedule.end_time >= time.start_time && schedule.end_time <= time.end_time) {
              respond(null, {success:false, message: 'Plantonista já possui um horário de '+ time.start_time + ' à ' + time.end_time + '.'})
            }else if(schedule.start_time <= time.start_time && schedule.end_time >= time.end_time){
              respond(null, {success:false, message: 'Plantonista já possui um horário de '+ time.start_time + ' à ' + time.end_time + '.'})
            }
        })
      })

      // var worked_hours=0;
      //
      // schedule.list$(
      //   {
      //     profile_id: schedule.profile_id,
      //     sector_id: schedule.sector_id
      //   },
      //   function(err,list){
      //     list.forEach(function(time){
      //       // conta horas
      //       worked_hours += get_schedule_duration(time.start_time, time.end_time)
      //     })
      //   })

      // validar min/max horas mes
      // if (worked_hours > scheduleSettings.max_hours_month) {
      //   respond(null, {success:false, message: 'Este funcionário já recebeu a carga maxima mensal'})
      // validar min/max horas semana
      // }else if (worked_hours > scheduleSettings.max_hours_week) {
      //   respond(null, {success:false, message: 'Este funcionário já recebeu a carga maxima semanal'})
      // }


    schedule.save$(function(err,schedule){
      respond(null, schedule)
    })
  })

// #############################################################################

  this.add('role:schedule, cmd:createScheduleSettings', function error(msg, respond){
    var scheduleSettings = this.make('scheduleSettings')
    scheduleSettings.max_hours_month = msg.max_hours_month
    scheduleSettings.max_hours_week = msg.max_hours_week
    scheduleSettings.min_hours_month = msg.min_hours_month
    scheduleSettings.min_hours_week = msg.min_hours_week
    scheduleSettings.templates = msg.templates

    console.log(msg);

    // validar se ids de templates são validos

    // 24*7 = 168
    var max_hours_in_a_week = 168;
    // 24*31 = 744
    var max_hours_in_a_month = 744;

    //Validações para vazio e menor que 0
    if (scheduleSettings.min_hours_week == null || scheduleSettings.min_hours_week == "") {
      respond(null, {success:false, message: 'O minimo de horas por semana não deve ser vazio'})
    } else if(scheduleSettings.min_hours_week < 0){
      respond(null, {success:false, message: 'O minimo de horas por semana não pode ser menor que zero'})
    } else if(scheduleSettings.min_hours_week >= max_hours_in_a_week){
      respond(null, {success:false, message: 'O minimo de horas por semana não pode ser maior ou igual a 168'})
    } else if (scheduleSettings.min_hours_month == null || scheduleSettings.min_hours_month == "") {
      respond(null, {success:false, message: 'O minimo de horas por mês não deve ser vazio'})
    } else if(scheduleSettings.min_hours_month < 0){
      respond(null, {success:false, message: 'O minimo de horas por mês não pode ser menor que zero'})
    } else if(scheduleSettings.min_hours_month >= max_hours_in_a_month){
      respond(null, {success:false, message: 'O minimo de horas por mês não pode ser maior ou igual a 744'})
    } else if (scheduleSettings.max_hours_week == null || scheduleSettings.max_hours_week == "") {
      respond(null, {success:false, message: 'O máximo de horas por semana não deve ser vazio'})
    } else if(scheduleSettings.max_hours_week < 0){
      respond(null, {success:false, message: 'O máximo de horas por semana não pode ser menor que zero'})
    } else if(scheduleSettings.max_hours_week >= max_hours_in_a_week){
      respond(null, {success:false, message: 'O máximo de horas por semana não pode ser maior ou igual a 168'})
    } else if (scheduleSettings.max_hours_month == null || scheduleSettings.max_hours_month == "") {
      respond(null, {success:false, message: 'O máximo de horas por mês não deve ser vazio'})
    } else if(scheduleSettings.max_hours_month < 0){
      respond(null, {success:false, message: 'O máximo de horas por mês não pode ser menor que zero'})
    } else if(scheduleSettings.max_hours_month >= max_hours_in_a_month){
      respond(null, {success:false, message: 'O máximo de horas por mês não pode ser maior ou igual a 744'})
    }

    //Validações para max mes não poder ser menor que max Week
    if (scheduleSettings.min_hours_month <= scheduleSettings.min_hours_week) {
      respond(null, {success:false, message: 'O minimo de horas por mês não pode ser menor ou igual o minimo de horas por semana'})
    } else if (scheduleSettings.max_hours_month <= scheduleSettings.max_hours_week) {
      respond(null, {success:false, message: 'O maximo de horas por mês não pode ser menor ou igual o máximo de horas por semana'})
    } else if (scheduleSettings.max_hours_month <= scheduleSettings.min_hours_month) {
      respond(null, {success:false, message: 'O minimo de horas por mês não pode ser menor ou igual o minimo de horas por semana'})
    } else if (scheduleSettings.max_hours_week <= scheduleSettings.min_hours_week) {
      respond(null, {success:false, message: 'O maximo de horas por mês não pode ser menor ou igual o máximo de horas por semana'})
    }

    scheduleSettings.save$(function(err,scale){
      respond(null,scale)
    })

  })

// #############################################################################

  this.add('role:schedule, cmd:listSchedule', function (msg, respond) {
      var schedule = this.make(schedule_db);
      var id = msg.id;
      schedule.list$({ all$: true }, function (error, schedule) {
          respond(null, schedule);
      });
  })

    // this.add('role:schedule,cmd:listDay', function (msg, respond) {
    //     var id = msg.id;
    //     var day = msg.day;
    //     var schedule = this.make(schedule_db);
    //     schedule.list$({ day, id }, function (error, schedule) {
    //         respond(null, schedule);
    //     });
    // })

    // this.add('role:schedule,cmd:listMonth', function (msg, respond) {
    //     var id = msg.id;
    //     var month = msg.month;
    //     var schedule = this.make(schedule_db);
    //     schedule.list$({ month, id }, function (error, schedule) {
    //       respond(null, schedule);
    //   });
    // })


    // this.add('role:schedule,cmd:listYear', function (msg, respond) {
    //   var id = msg.id;
    //   var year = msg.year;
    //   console.log(id);
    //   var schedule = this.make(schedule_db);
    //   schedule.list$({ id, year }, function (error, schedule) {
    //     respond(null, schedule);
    //
    //   });
    // })
    //
    // this.add('role:schedule,cmd:listWeek', function (msg, respond) {
    //   var id = msg.id;
    //   var week = msg.week;
    //   var schedule = this.make(schedule_db);
    //   schedule.list$({ id, week }, function (error, schedule) {
    //     respond(null, schedule);
    //
    //   });
    // })
    //
    // this.add('role:schedule,cmd:listHourWeek', function (msg, respond) {
    //     var id = msg.id;
    //     var week = msg.week;
    //     var hoursForWeek = 0;
    //     var schedule = this.make(schedule_db);
    //     schedule.list$({ id, week }, function (error, list) {
    //         hoursForWeek = JSON.stringify(hoursForWeek);
    //         respond(null, { hoursForWeek });
    //     });
    // })
    //
    // this.add('role:schedule,cmd:listSectorDay', function (msg, respond) {
    //   var sector_id = msg.sector_id;
    //   var day = msg.day;
    //   var schedule = this.make(schedule_db);
    //   schedule.list$({ day , sector_id }, function (error, schedule) {
    //     respond(null, schedule);
    //   });
    // })
    //
    // this.add('role:schedule,cmd:listSectorMonth', function (msg, respond) {
    //     var sector_id = msg.sector_id;
    //      var month = msg.month;
    //       var schedule = this.make(schedule_db);
    //       schedule.list$({ month , sector_id }, function (error, schedule) {
    //           respond(null, schedule);
    //       });
    //   })
    //
    //   this.add('role:schedule,cmd:listSectorYear',function(msg,respond){
    //     var sector_id = msg.sector_id;
    //     var year = msg.year;
    //     var schedule = this.make(schedule_db);
    //     schedule.list$({year , sector_id},function(error,schedule){
    //         respond(null,schedule);
    //     });
    // })
    //
    // this.add('role:schedule,cmd:listSectorWeek',function(msg,respond){
    //     var sector_id = msg.sector_id;
    //     var week = msg.week;
    //     var schedule = this.make(schedule_db);
    //     schedule.list$({sector_id , week}, function(error,schedule){
    //         respond(null,schedule);
    //     });
    // })

    this.add('role:schedule, cmd:error', function error(msg, respond) {
        respond(null, { success: false, message: 'acesso negado' });
    })
}
