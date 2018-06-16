var Promise = require('bluebird');

// BDs names
var schedule_db = 'schedules'
var schedule_settings_db = 'scheduleSettings'

function get_schedule_duration(start_time, end_time){
  // The diference between times is given in milliseconds. We are expecting hours,
  //so wu divide by 3600000.0 that is the number of milliseconds in 1 hour
  return duration = (end_time - start_time)/3600000.0
}

module.exports = function(options){
  this.add('role:schedule,cmd:createSchedule', async function create (msg,respond) {
    var schedule = this.make(schedule_db);
    var scheduleSettings = this.make(schedule_settings_db);
    result = {};
    schedule.start_time = new Date(msg.start_time);
    schedule.end_time = new Date(msg.end_time);
    schedule.sector_id = parseInt(msg.sector_id);
    schedule.profile_id = parseInt(msg.profile_id);

    // validar apenas mongo object IDs no caso do profile e do sector

    // validates if the amount of minimum hours in a schedule is less than allowed
    if (get_schedule_duration(schedule.start_time, schedule.end_time) < scheduleSettings.min_hours_schedule){
      result.min_hours_limit_error = 'Limite mínimo de '+ scheduleSettings.min_hours_schedule +' horas por horário'
      result.success = false;
      respond(null, result)
    }

    // validates if any schedule conflict has occurred
    var list$ = Promise.promisify(schedule.list$, { context: schedule });
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
    .then(await function(list){
      if (list.length != 0){
        result.conflicts_error = 'Plantonista já possui um horário de '+ list[0].start_time + ' à ' + list[0].end_time;
        result.success = false;
        respond(null, result);
      } else {
        // sucess
        // nothing to do
      }
    })
    .catch(function(err) {
      console.log('error')
    })

    // creates a one day interval
    var first_hour_of_day = new Date(schedule.start_time);
    var last_hour_of_day = new Date(schedule.start_time);
    first_hour_of_day.setHours(0, 0);
    last_hour_of_day.setHours(24,0);
    worked_hours_in_a_day = 0;

    // lists every schedule in a one day interval
    await list$(
    {
      and$: [
        {or$:[
          {start_time: {
            $gte: first_hour_of_day,
            $lt: last_hour_of_day
          }},
          {end_time: {
            $lte: last_hour_of_day,
            $gte: first_hour_of_day
          }}
        ]},
        {profile_id: schedule.profile_id},
        {sector_id: schedule.sector_id}
      ]
    })
    .then(await function(list){
      // Walks on the schedules list and count the amount of hours
      list.forEach(function(time){
        console.log('Parcial' + worked_hours_in_a_day);
        worked_hours_in_a_day += get_schedule_duration(time.start_time, time.end_time)
      })
      // validates if the amount of hours in a day is bigger than than allowed
      if ((worked_hours_in_a_day + get_schedule_duration(schedule.start_time, schedule.end_time)) > scheduleSettings.max_hours_day){
        result.max_hours_limit = 'Você já tem ' + worked_hours_in_a_day + 'horas nesse dia. ' + 'O limite é de '+ scheduleSettings.max_hours_day +' horas por dia'
        return result;
      } else {
        // sucess
        // nothing to do
      }
    })
    .catch(function(err) {
      console.log('error')
    })

    // crates an interval of one week
    first_day_of_week = new Date(schedule.start_time.getFullYear(),
                            schedule.start_time.getMonth(),
                            (schedule.start_time.getDate() -
                            schedule.start_time.getDay()), 0, 0, 0);
    last_day_of_week = new Date(schedule.start_time.getFullYear(),
                          schedule.start_time.getMonth(),
                          (schedule.start_time.getDate() -
                          schedule.start_time.getDay() + 7), 0, 0, 0);
    worked_hours_in_a_week = 0;

    // lists every schedule in a one week interval
    await list$(
    {
      and$: [
        {or$:[
          {start_time: {
            $gte: first_day_of_week,
            $lt: last_day_of_week
          }},
          {end_time: {
            $lte: last_day_of_week,
            $gte: first_day_of_week
          }}
        ]},
        {profile_id: schedule.profile_id}
      ]
    })
    .then(await function(list){
      // Walks on the schedules list and count the amount of hours
      list.forEach(function(time){
        console.log('Parcial' + worked_hours_in_a_week);
        worked_hours_in_a_week += get_schedule_duration(time.start_time, time.end_time)
      })
      // validates if the amount of hours in a week is bigger than than allowed
      if ((worked_hours_in_a_week + get_schedule_duration(schedule.start_time, schedule.end_time)) > scheduleSettings.max_hours_week){
        result.max_hours_limit = 'Você já tem ' + worked_hours_in_a_week + 'horas nessa semana. ' + 'O limite é de '+ scheduleSettings.max_hours_week +' horas por semana'
        return result;
      } else {
        // sucess
        // nothing to do
      }
    })
    .catch(function(error){
      console.log('error')
    })

    // creates an interval of one month
    month = parseInt(schedule.start_time.getMonth());
    year = parseInt(schedule.start_time.getFullYear());
    start_of_month = new Date(year, month, 1);
    end_of_month = new Date(year, month+1, 1);
    worked_hours_in_a_month = 0

    await list$(
      {
        and$: [
          {start_time: {
            $gte: start_of_month,
            $lt: end_of_month
          }},
          {profile_id: schedule.profile_id}
        ]
      })
      .then(await function(list){
        list.forEach(function(time){
          worked_hours_in_a_month += get_schedule_duration(time.start_time, time.end_time)
        })

        if ((worked_hours_in_a_month + get_schedule_duration(schedule.start_time,schedule.end_time)) > schedule_settings.max_hours_month){
          result.max_hours_limit = 'Você já tem ' + worked_hours_in_a_month + 'horas nessa més. ' + 'O limite é de '+ scheduleSettings.max_hours_month +' horas por més'
          return result;
        } else {
          //success
          //nothing to do
        }
      })
      .catch(function(error){
        console.log(error);
      })

      if(Object.entries(result)[0]){
        console.log('depois')
      } else {
        schedule.save$(function(err,schedule){
          respond(null, schedule)
        })
      }
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
