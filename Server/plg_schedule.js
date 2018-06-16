var schedule_db = 'schedules'
var schedule_settings_db = 'scheduleSettings'
module.exports = function(options){
    this.add('role:schedule,cmd:createSchedule', function create (msg,respond) {
      var schedule = this.make(schedule_db)
      var scheduleSettings = this.make()
      schedule.start_time = msg.start_time
      schedule.end_time = msg.end_time
      schedule.sector_id = msg.sector_id
      schedule.profile_id = msg.profile_id

      // validar apenas mongo object IDs no caso do profile e do sector

      // validate if have any schedule conflict has occurred
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
            console.log("Verificando conflitos de horarios...")
            console.log(time)
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

  this.add('role:schedule, cmd:listByProfile', function (msg, respond) {
      var schedule = this.make(schedule_db);
      var id = msg.id;
      console.log("id informado:" + id);
      schedule.list$(
        {
          profile_id: id,
        },
        function (error, schedule) {
          console.log("Schedules:" + schedule);
          respond(null, schedule);
        }
      );
  })

// #############################################################################

  this.add('role:schedule,cmd:listYearByProfile', function (msg, respond) {
    console.log("Msg:")
    console.log(msg);
    var schedule = this.make(schedule_db);
    schedule.profile_id = msg.profile_id;
    start_year = msg.start_year;
    end_year = msg.end_year;

    schedule.list$(
      {
        and$: [
          {or$:[
            {start_time: {
              $gte: start_year,
              $lt: end_year
            }},
            {end_time: {
              $lte: end_year,
              $gt: start_year
            }}
          ]},
          {profile_id: schedule.profile_id},
        ]
      },
      function(err,list){
        console.log(list)
        respond (null, list)
    })
  })

// #############################################################################

this.add('role:schedule,cmd:listYearBySector', function (msg, respond) {
  console.log(msg);
  var schedule = this.make(schedule_db);
  schedule.sector_id = msg.sector_id;
  start_year = msg.start_year;
  end_year = msg.end_year;

  console.log("Start year:")
  console.log(start_year)

  schedule.list$(
    {
      and$: [
        {or$:[
          {start_time: {
            $gte: start_year,
            $lt: end_year
          }},
          {end_time: {
            $lte: end_year,
            $gt: start_year
          }}
        ]},
        {sector_id: schedule.sector_id},
      ]
    },
    function(err,list){
      respond (null, list)
  })
})

// #############################################################################

this.add('role:schedule,cmd:listYearByUser', function (msg, respond) {
  console.log(msg);
  var schedule = this.make(schedule_db);
  user_id = msg.user_id;
  start_year = msg.start_year;
  end_year = msg.end_year;

  //buscar lista de profile_id a partir do user_id
  profiles_id = [12, 1023, 131, 1231]

  schedule.list$(
    {
      start_time: {
        $gte: start_year,
        $lt: end_year
      },
      profile_id: [
        12,
        1023,
        131,
        1231
      ],
    },
    function(err,list){
      respond (null, list)
  })
})

// #############################################################################

  this.add('role:schedule, cmd:createScheduleSettings', function error(msg, respond){
    var scheduleSettings = this.make(schedule_settings_db)
    scheduleSettings.max_hours_month = parseInt(msg.max_hours_month)
    scheduleSettings.max_hours_week = parseInt(msg.max_hours_week)
    scheduleSettings.min_hours_month = parseInt(msg.min_hours_month)
    scheduleSettings.min_hours_week = parseInt(msg.min_hours_week)
    scheduleSettings.templates = msg.templates

    scheduleSettings.save$(function(err, scheduleSettings){
      respond(null, scheduleSettings)
    })
  })

// #############################################################################

  this.add('role:schedule, cmd:error', function error(msg, respond) {
      respond(null, { success: false, message: 'acesso negado' });
  })
}
