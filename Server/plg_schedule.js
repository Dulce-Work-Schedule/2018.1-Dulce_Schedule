module.exports = function(options){
  this.add('role:schedule,cmd:createSchedule', function create (msg,respond) {
    var schedule = this.make('schedules')
    schedule.start_time = msg.start_time
    schedule.end_time = msg.end_time
    schedule.sector_id = msg.sector_id
    schedule.profile_id = msg.profile_id

    // Valida inicio menor que fim
    if( (schedule.start_time - schedule.start_time) < 0 ){
      respond(null, {success:false, message: 'O fim do horário deve ser maior que o início do horário.'})
    }else if( (schedule.start_time - schedule.start_time) == 0 ){
      respond(null, {success:false, message: 'O horário de início e de fim não podem ser iguais.'})
    }

    worked_hours=0
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
          // conta horas
          worked_hours += get_schedule_duration(time.start_time, time.end_time)

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

      schedule.list$(
        {
          profile_id: schedule.profile_id,
          sector_id: schedule.sector_id
        },
        function(err,list){
          list.forEach(function(time){
            // conta horas
            worked_hours += get_schedule_duration(time.start_time, time.end_time)
          })
        })

      // validar min/max horas mes
      if (worked_hours > scheduleSettings.max_hours_month) {
        respond(null, {success:false, message: 'Este funcionário possui uma escala em conflito com o horário selecionado'})
      // }else if () {
        // respond(null, {success:false, message: 'Este funcionário possui uma escala em conflito com o horário selecionado'})
      // }else if(){
        // respond(null, {success:false, message: 'Este funcionário possui uma escala em conflito com o horário selecionado'})
      }

      // validar min/max horas semana

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

    //Validations
    // if (scheduleSettings.min_hours_week == null || (scheduleSettings.min_hours_week < 1)) {
    //   respond(null, {success:false, message: 'O minimo de horas por semana não deve ser vazio'})
    // } else if(scheduleSettings.min_hours_month == null || (scheduleSettings.min_hours_month < 1) ){
    //   respond(null, {success:false, message: 'O minimo de horas por mês não deve ser vazio'})
    // }


    scheduleSettings.save$(function(err,scale){
      respond(null,scale)
    })

  })

// #############################################################################

  // this.add('role:schedule, cmd:listSchedule', function (msg, respond) {
  //
  //     var schedule = this.make('schedule');
  //     var id = msg.id;
  //     schedule.list$({ all$: true }, function (error, schedule) {
  //         respond(null, schedule);
  //     });
  // })

    // this.add('role:schedule,cmd:listDay', function (msg, respond) {
    //     var id = msg.id;
    //     var day = msg.day;
    //     var schedule = this.make('schedule');
    //     schedule.list$({ day, id }, function (error, schedule) {
    //         respond(null, schedule);
    //     });
    // })

    // this.add('role:schedule,cmd:listMonth', function (msg, respond) {
    //     var id = msg.id;
    //     var month = msg.month;
    //     var schedule = this.make('schedule');
    //     schedule.list$({ month, id }, function (error, schedule) {
    //       respond(null, schedule);
    //   });
    // })


    // this.add('role:schedule,cmd:listYear', function (msg, respond) {
    //   var id = msg.id;
    //   var year = msg.year;
    //   console.log(id);
    //   var schedule = this.make('schedule');
    //   schedule.list$({ id, year }, function (error, schedule) {
    //     respond(null, schedule);
    //
    //   });
    // })
    //
    // this.add('role:schedule,cmd:listWeek', function (msg, respond) {
    //   var id = msg.id;
    //   var week = msg.week;
    //   var schedule = this.make('schedule');
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
    //     var schedule = this.make('schedule');
    //     schedule.list$({ id, week }, function (error, list) {
    //         hoursForWeek = JSON.stringify(hoursForWeek);
    //         respond(null, { hoursForWeek });
    //     });
    // })
    //
    // this.add('role:schedule,cmd:listSectorDay', function (msg, respond) {
    //   var sector_id = msg.sector_id;
    //   var day = msg.day;
    //   var schedule = this.make('schedule');
    //   schedule.list$({ day , sector_id }, function (error, schedule) {
    //     respond(null, schedule);
    //   });
    // })
    //
    // this.add('role:schedule,cmd:listSectorMonth', function (msg, respond) {
    //     var sector_id = msg.sector_id;
    //      var month = msg.month;
    //       var schedule = this.make('schedule');
    //       schedule.list$({ month , sector_id }, function (error, schedule) {
    //           respond(null, schedule);
    //       });
    //   })
    //
    //   this.add('role:schedule,cmd:listSectorYear',function(msg,respond){
    //     var sector_id = msg.sector_id;
    //     var year = msg.year;
    //     var schedule = this.make('schedule');
    //     schedule.list$({year , sector_id},function(error,schedule){
    //         respond(null,schedule);
    //     });
    // })
    //
    // this.add('role:schedule,cmd:listSectorWeek',function(msg,respond){
    //     var sector_id = msg.sector_id;
    //     var week = msg.week;
    //     var schedule = this.make('schedule');
    //     schedule.list$({sector_id , week}, function(error,schedule){
    //         respond(null,schedule);
    //     });
    // })

    this.add('role:schedule, cmd:error', function error(msg, respond) {
        respond(null, { success: false, message: 'acesso negado' });
    })
}
