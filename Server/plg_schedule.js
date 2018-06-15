var Promise = require('bluebird');

var schedule_db = 'schedules'
var schedule_settings_db = 'scheduleSettings'

module.exports = function(options){

    this.add('role:schedule,cmd:createSchedule', async function create (msg,respond) {
      var schedule = this.make(schedule_db)
      var scheduleSettings = this.make()
      var worked_hours=0;
      schedule.start_time = new Date(msg.start_time)
      schedule.end_time = new Date(msg.end_time)
      schedule.sector_id = msg.sector_id
      schedule.profile_id = msg.profile_id

      // validar apenas mongo object IDs no caso do profile e do sector

      console.log("antes");
      // validate if have any schedule conflict has occurred

      var list$ = Promise.promisify(schedule.list$, { context: schedule });
      var valid = true;
      await list$(
        {
          and$: [
            {or$:[
              {start_time: {
                $gte: schedule.start_time,
                $lt: schedule.end_time
              }},
              {end_time: {
                $lte: schedule.end_time,
                $gt: schedule.start_time
              }}
            ]},
            {profile_id: schedule.profile_id},
            {sector_id: schedule.sector_id}
          ]
        })
        .then(function(list){
          if (list.length != 0){
            valid = false;
          } else
              valid = true;
        })
        .catch(function(ameixa) {
          console.log('error')
        })

      if (!valid)
        return respond(null, {success:false, message: 'Plantonista já possui um horário :('})


      month = parseInt(schedule.start_time.getMonth());
      year = parseInt(schedule.start_time.getFullYear());
      start_month = new Date(year, month, 1);
      end_month = new Date(year, month+1, 1);

      schedule.list$(
        {
          start_time: {
            $gte: start_month,
            $lt: end_month
          },
          profile_id: schedule.profile_id,
          sector_id: schedule.sector_id
        },
        function(err,list){
          list.forEach(function(time){
            worked_hours += get_schedule_duration(time.start_time, time.end_time)
          })
        })

        console.log('depois')

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
