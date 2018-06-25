  var Promise = require('bluebird');

  // BDs names
  var schedule_db = 'schedules'
  var schedule_settings_db = 'scheduleSettings'

  var default_settings = {
    "max_hours_month": 145,
    "max_hours_week": 50,
    "min_hours_month": 60,
    "min_hours_week": 11,
    "min_hours_schedule": 1,
    "max_hours_day": 24,
    "templates": [1,2,3, 4]
  };
  // 3600000.0 (1000ms * 60s * 60m), is the number of milliseconds in 1 hour.
  var milliseconds_in_one_hour = 3600000.0

  // get_schedule_duration returns schedule duration in hours
  function get_schedule_duration( start_time, end_time){
    // The diference between Dates are given in milliseconds.
    // So we divide by the amount of milliseconds in 1 hour
    console.log(start_time);
    console.log(end_time);
    var duration = (
      (end_time - start_time) /
      milliseconds_in_one_hour
      );
    console.log('Duração:{}'.format(duration));
    return duration;
  }

  // Alternative python string.format() for javascript
  // First, checks if it isn't implemented yet.
  if (!String.prototype.format) {
    String.prototype.format = function(){
      var replaceable_count = (this.match(/{}/g) || []).length;
      if(arguments.length < replaceable_count){
        console.log(
          "Expecting " + replaceable_count + "arguments, " +
          arguments.length + 'found.');
        return this
      }else{
        var new_string = this;
        for (i=0; i < replaceable_count; i++){
          new_string = new_string.replace('{}', arguments[i]);
        }
        return new_string
      }
    };
  }

  module.exports = function(options){
    this.add('role:schedule,cmd:create', async function create (msg,respond) {
      // schedule Entity
      var schedule = this.make(schedule_db);
      // scheduleSettings Entity
      var scheduleSettings = this.make(schedule_settings_db);
      // Promise of Schedule list$ function
      var schedule_list$ = Promise.promisify(schedule.list$, { context: schedule });
      var settings_list$ = Promise.promisify(scheduleSettings.list$, { context: scheduleSettings });

      var result = {};

      var start_time = new Date(msg.start_time);
      var end_time = new Date(msg.end_time);
      var sector_id = msg.sector_id;
      var profile_id = msg.profile_id;

      var settings = default_settings

      await settings_list$({})
      .then(await function(list_of_settings){
        if (list_of_settings.length > 0){
          settings = list_of_settings[0]
        }
      })
      .catch(function(err){
          // result.scheduleSettings_catch_error = "Não conseguiu achar schedule settings";
        })

      // validates if the amount of minimum hours in a schedule is less than allowed
      if (get_schedule_duration(start_time, end_time) < scheduleSettings.min_hours_schedule){
        result.min_hours_limit_error = (
          'Limite mínimo de {} horas por horário'.format(
            settings.min_hours_schedule
            )
          )
      }
      var start_interval = new Date(start_time)
      var end_interval = new Date(end_time)
      start_interval.setDate(start_interval.getDate()-1)
      end_interval.setDate(end_interval.getDate()+1)
      // validates if any schedule conflict has occurred
      await schedule_list$(
      {
        start_time: {
          $gte: start_interval,
          $lt: end_interval
        },
        profile_id: profile_id
      })
      .then(await function(list_of_schedules){
        if (list_of_schedules.length != 0){
          list_of_schedules.forEach(function(schedule_element){
            if (start_time >= schedule_element.start_time  && start_time < schedule_element.end_time){
              // if start_time are in schedule_element interval, it gives an error
              result.conflicts_error = (
                '{} já possui um horário de {} à {}'.format(
                  'Plantonista',
                  schedule_element.start_time,
                  schedule_element.end_time
                  )
                )
            } else if (end_time > schedule_element.start_time  && end_time <= schedule_element.end_time){
              // if end_time are in schedule_element interval, it gives an error
              result.conflicts_error = (
                '{} já possui um horário de {} à {}'.format(
                  'Plantonista',
                  schedule_element.start_time,
                  schedule_element.end_time
                  )
                )
            } else if (start_time <= schedule_element.start_time  && end_time >= schedule_element.end_time){
              //
              result.conflicts_error = (
                '{} já possui um horário de {} à {}'.format(
                  'Plantonista',
                  schedule_element.start_time,
                  schedule_element.end_time
                  )
                )
            }
          });

        } else {
          // sucess
          // nothing to do
        }
      })
      .catch(function(err) {
        console.log('error')
      })

      // creates a one day interval
      var first_hour_of_day = new Date(start_time);
      var last_hour_of_day = new Date(start_time);
      first_hour_of_day.setHours(0, 0);
      last_hour_of_day.setHours(24,0);
      current_amount_of_day_work_hours = 0;

      // lists every schedule in a one day interval
      await schedule_list$(
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
          {profile_id: profile_id},
          {sector_id: sector_id}
          ]
        })
      .then(await function(list_of_schedules){
        // Walks on the list of schedules and counts the amount of hours worked
        list_of_schedules.forEach(
          function(schedule_element){
            console.log(
              'Parcial Working Hours: <|{}|>'.format(
                current_amount_of_day_work_hours
                )
              );
            current_amount_of_day_work_hours = (
              current_amount_of_day_work_hours +
              get_schedule_duration(
                schedule_element.start_time,
                schedule_element.end_time
                )
              );
          }
          )

        new_amount_of_day_work_hours = (
          current_amount_of_day_work_hours +
          get_schedule_duration(start_time, end_time)
          )
        // validates if the amount of hours in a day is bigger than allowed
        if (new_amount_of_day_work_hours > settings.max_hours_day){
          result.max_hours_limit_error = (
            'Você já tem {} horas nesse dia. O limite é de {} horas por dia'.format(
              worked_hours_in_a_day,
              settings.max_hours_day
              )
            );
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
      first_day_of_week = new Date(start_time.getFullYear(),
       start_time.getMonth(),
       (start_time.getDate() -
         start_time.getDay()), 0, 0, 0);
      last_day_of_week = new Date(start_time.getFullYear(),
       start_time.getMonth(),
       (start_time.getDate() -
         start_time.getDay() + 7), 0, 0, 0);

      var current_amount_of_week_work_hours = 0;

      // lists every schedule in a one week interval
      await schedule_list$(
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
          {profile_id: profile_id}
          ]
        })
      .then(await function(list_of_schedules){
        // Walks on the schedules list and count the amount of hours
        list_of_schedules.forEach(function(time){
          console.log('Parcial: {}'.format(current_amount_of_week_work_hours));
          current_amount_of_week_work_hours = (
            current_amount_of_week_work_hours +
            get_schedule_duration(
              time.start_time,
              time.end_time
              )
            )
        })
        console.log("Horas trabalhadas na semana: {}".format(current_amount_of_week_work_hours))
        var new_amount_of_week_work_hours = (
          current_amount_of_week_work_hours +
          get_schedule_duration(start_time, end_time)
          );
        console.log("Horas trabalhadas com o novo horário: {}".format(new_amount_of_week_work_hours))

        // validates if the amount of hours in a week is bigger than allowed
        if (new_amount_of_week_work_hours > settings.max_hours_week){
          result.max_week_hours_limit_error = (
            'Você já tem {} horas nessa semana. O limite é de {} horas por semana'.format(
              new_amount_of_week_work_hours,
              settings.max_hours_week
              )
            );
        } else {
          // sucess!! nothing to do
        }
      })
      .catch(function(error){
        console.log('error')
      })

      // creates an interval of one month
      month = parseInt(start_time.getMonth());
      year = parseInt(start_time.getFullYear());
      start_of_month = new Date(year, month, 1);
      end_of_month = new Date(year, month+1, 1);
      var current_amount_of_month_work_hours = 0

      await schedule_list$(
      {
        and$: [
        {start_time: {
          $gte: start_of_month,
          $lt: end_of_month
        }},
        {profile_id: profile_id}
        ]
      })
      .then(await function(list_of_schedules){

        list_of_schedules.forEach(function(time){
          current_amount_of_month_work_hours = (
            current_amount_of_month_work_hours +
            get_schedule_duration(time.start_time, time.end_time)
            );
        })

        var new_amount_of_month_work_hours = (
          current_amount_of_month_work_hours +
          get_schedule_duration(start_time,end_time));
          // validates if the amount of hours in month is bigger than allowed
          if (new_amount_of_month_work_hours > settings.max_hours_month){
            result.max_hours_limit_error = (
              'Você já tem {} horas nesse mês. O limite é de {} horas por mês'.format(
                current_amount_of_month_work_hours,
                settings.max_hours_month
                )
              );
          } else {
            //success
            //nothing to do
          }
        })
      .catch(function(error){
        console.log(error);
      })

      if(Object.entries(result).length > 0){
        result.success = false;
        console.log('Alguns erros foram encontrados...');
        console.log(result);
        respond(null, result);
      } else {
        schedule.start_time = start_time
        schedule.end_time = end_time
        schedule.sector_id = sector_id
        schedule.profile_id = profile_id
        schedule.save$(function(err,schedule){
          respond(null, schedule);
        })
      }
    })

  // #############################################################################

  this.add('role:schedule, cmd:listByProfile', function (msg, respond) {
    var schedule = this.make(schedule_db);
    var id = msg.id;
    console.log("id informado: {}".format(id));
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

  this.add('role:schedule,cmd:listByProfile', function (msg, respond) {
    console.log(msg);
    var schedule = this.make(schedule_db);
    schedule.profile_id = msg.profile_id;
    start_year = new Date(msg.start_year);
    end_year = new Date(msg.end_year);

    schedule.list$(
    {
      start_time: {
        $gte: start_year,
        $lt: end_year
      },
      profile_id: schedule.profile_id,
    },
    function(err,list){
      if (list.length > 0) {
        console.log("Have list:");
        console.log(list);
        console.log("EnDHave list");
      }else{
        console.log("We DONT Have list:");
      }
      respond (null, list)
    })
  })

    // #############################################################################

    this.add('role:schedule,cmd:listBySector', function (msg, respond) {
      console.log(msg);
      var schedule = this.make(schedule_db);
      schedule.sector_id = msg.sector_id;
      start_year = new Date(msg.start_year);
      end_year = new Date(msg.end_year);

      schedule.list$(
      {
        start_time: {
          $gte: start_year,
          $lt: end_year
        },
        sector_id: schedule.sector_id,
      }, function(err, sector_schedules){
        respond (null, sector_schedules)
      });
    });

    // #############################################################################

    this.add('role:schedule,cmd:changeListBySector', function (msg, respond) {
      console.log(msg);
      var schedule = this.make(schedule_db);
      sector_id = msg.sector_id;
      profile_id = msg.profile_id;
      start_year = new Date(msg.start_year);
      end_year = new Date(msg.end_year);

      schedule.list$(
      {
        start_time: {
          $gte: start_year,
          $lt: end_year
        },
        sector_id: sector_id,
        profile_id:{$not:{$eq:profile_id}}
      }, function(err, sector_schedules){
        respond (null, sector_schedules)
      });
    });

  // #############################################################################

  this.add('role:schedule,cmd:listByUser', function (msg, respond) {
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

  this.add('role:schedule, cmd:createSettings', function error(msg, respond){
    var scheduleSettings = this.make(schedule_settings_db)
    scheduleSettings.max_hours_month = parseInt(msg.max_hours_month)
    scheduleSettings.max_hours_week = parseInt(msg.max_hours_week)
    scheduleSettings.max_hours_day = parseInt(msg.max_hours_day)
    scheduleSettings.min_hours_month = parseInt(msg.min_hours_month)
    scheduleSettings.min_hours_week = parseInt(msg.min_hours_week)
    scheduleSettings.min_hours_schedule = parseInt(msg.min_hours_schedule)
    scheduleSettings.templates = msg.templates

    scheduleSettings.save$(function(err, scheduleSettings){
      respond(null, scheduleSettings)
    })
  })

    // #############################################################################
    this.add('role:schedule,cmd:edit', async function edit (msg,respond) {
      // schedule Entity
      var schedule = this.make(schedule_db);
      // scheduleSettings Entity
      var scheduleSettings = this.make(schedule_settings_db);
      // Promise of Schedule list$ function
      var schedule_list$ = Promise.promisify(schedule.list$, { context: schedule });
      var settings_list$ = Promise.promisify(scheduleSettings.list$, { context: scheduleSettings });
      var load$ = Promise.promisify(schedule.load$, { context: schedule });
      var schedule_id = msg.schedule_id
      console.log("Edit msg ");
      console.log(msg);

      var edited_schedule = {};
      var current_schedule = {};
      var result = {};

      await load$(schedule_id)
      .then(function(schedule){
        if (schedule == null){
          console.log("if");
          console.log(schedule);
          result.schedule_not_find = "Horário não encontrado";
          respond(null, result);
        }else{
          console.log("else");
          console.log(schedule);
          edited_schedule = schedule
          current_schedule = schedule
        }
      })
      .catch(function(error){
        respond(null, error);
      })

      console.log("edited");
      console.log(edited_schedule);

      if (msg.start_time != null){
        console.log(msg.start_time);
        edited_schedule.start_time = new Date(msg.start_time);
      } else {
        console.log("deu ruim na data edited_schedule.start_time");
      }
      if (msg.end_time != null){
        console.log(msg.end_time);
        edited_schedule.end_time = new Date(msg.end_time);
      } else {
        console.log("deu ruim na data edited_schedule.end_time");
      }

      if((edited_schedule.end_time - edited_schedule.start_time) < 0){
        result.date_interval_error = 'O fim do horário deve ser maior que o início do horário'
        console.log(result.date_interval_error);
      }else if((edited_schedule.end_time - edited_schedule.start_time) == 0){
        result.date_equals_error = 'O horário de início e de fim não podem ser iguais'
        console.log(result.date_interval_error);
      }
      if (get_schedule_duration(edited_schedule.start_time, edited_schedule.end_time) > 24){
        result.schedule_bigger_than_limit_error = 'O horário deve ser de no máximo 1 dia';
        console.log(result.schedule_bigger_than_limit_error)
      }

      console.log("new edited");
      console.log(edited_schedule);

      var settings = default_settings

      await settings_list$({})
      .then(await function(list_of_settings){
        if (list_of_settings.length > 0){
          settings = list_of_settings[0]
        } else {
            // Do nothing
          }
        })
      .catch(function(err){
          // result.scheduleSettings_catch_error = "Não conseguiu achar schedule settings";
        })

      // validates if the amount of minimum hours in a schedule is less than allowed
      if (get_schedule_duration(edited_schedule.start_time, edited_schedule.end_time) < scheduleSettings.min_hours_schedule){
        result.min_hours_limit_error = (
          'Limite mínimo de {} horas por horário'.format(
            settings.min_hours_schedule
            )
          )
      }

      console.log("result::::");
      console.log(result);

      var start_interval = new Date(edited_schedule.start_time)
      var end_interval = new Date(edited_schedule.end_time)
      start_interval.setDate(start_interval.getDate()-1)
      end_interval.setDate(end_interval.getDate()+1)
      // validates if any schedule conflict has occurred
      console.log("id!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.log(edited_schedule.id);
      await schedule_list$(
      {
        start_time: {
          $gte: start_interval,
          $lt: end_interval,
          $not:{$eq:edited_schedule.start_time}
        },
        profile_id: edited_schedule.profile_id
      })
      .then(await function(list_of_schedules){
        console.log("list_of_schedules::::");
        console.log(list_of_schedules);
        if (list_of_schedules.length != 0){
          list_of_schedules.forEach(function(schedule_element){
            if (edited_schedule.start_time >= schedule_element.start_time  && edited_schedule.start_time < schedule_element.end_time){
              // if start_time are in schedule_element interval, it gives an error
              result.conflicts_error = (
                '{} já possui um horário de {} à {}'.format(
                  'Plantonista',
                  schedule_element.start_time,
                  schedule_element.end_time
                  )
                )
            } else if (edited_schedule.end_time > schedule_element.start_time  && edited_schedule.end_time <= schedule_element.end_time){
              // if end_time are in schedule_element interval, it gives an error
              result.conflicts_error = (
                '{} já possui um horário de {} à {}'.format(
                  'Plantonista',
                  schedule_element.start_time,
                  schedule_element.end_time
                  )
                )
            } else if (edited_schedule.start_time <= schedule_element.start_time  && edited_schedule.end_time >= schedule_element.end_time){
              //
              result.conflicts_error = (
                '{} já possui um horário de {} à {}'.format(
                  'Plantonista',
                  schedule_element.start_time,
                  schedule_element.end_time
                  )
                )
            }
          });

        } else {
          // sucess
          // nothing to do
        }
      })
      .catch(function(err) {
        console.log('error')
      })
      console.log("result::::::::::");
      console.log(result);


      // creates a one day interval
      var first_hour_of_day = new Date(edited_schedule.start_time);
      var last_hour_of_day = new Date(edited_schedule.start_time);
      first_hour_of_day.setHours(0, 0);
      last_hour_of_day.setHours(24,0);
      current_amount_of_day_work_hours = 0;

      // lists every schedule in a one day interval
      await schedule_list$(
      {
        start_time: {
          $gte: first_hour_of_day,
          $lt: last_hour_of_day,
          $not:{$eq:edited_schedule.start_time}
        },
        profile_id: edited_schedule.profile_id
      })
      .then(await function(list_of_schedules){
        console.log("::::::list_of_schedules::::::");
        console.log(list_of_schedules);
        // Walks on the list of schedules and counts the amount of hours worked
        list_of_schedules.forEach(
          function(schedule_element){
            console.log(
              'Parcial Working Hours: <|{}|>'.format(
                current_amount_of_day_work_hours
                )
              );
            current_amount_of_day_work_hours = (
              current_amount_of_day_work_hours +
              get_schedule_duration(
                schedule_element.start_time,
                schedule_element.end_time
                )
              );
          }
          )
        new_amount_of_day_work_hours = (
          current_amount_of_day_work_hours +
          get_schedule_duration(edited_schedule.start_time, edited_schedule.end_time)
          )
        // validates if the amount of hours in a day is bigger than allowed
        if (new_amount_of_day_work_hours > settings.max_hours_day){
          result.max_hours_limit_error = (
            'Você já tem {} horas nesse dia. O limite é de {} horas por dia'.format(
              current_amount_of_day_work_hours,
              settings.max_hours_day
              )
            );
          return result;
        } else {
          // sucess
          // nothing to do
        }
      })
      .catch(function(err) {
        console.log('error')
        console.log(err);
      })

      // crates an interval of one week
      first_day_of_week = new Date(current_schedule.start_time.getFullYear(),
       current_schedule.start_time.getMonth(),
       (current_schedule.start_time.getDate() -
         current_schedule.start_time.getDay()), 0, 0, 0);
      last_day_of_week = new Date(current_schedule.start_time.getFullYear(),
       current_schedule.start_time.getMonth(),
       (current_schedule.start_time.getDate() -
         current_schedule.start_time.getDay() + 7), 0, 0, 0);

      var current_amount_of_week_work_hours = 0;

      // lists every schedule in a one week interval
      await schedule_list$(
      {
        start_time: {
          $gte: first_day_of_week,
          $lt: last_day_of_week,
          $not:{$eq:current_schedule.start_time}
        },
        profile_id: edited_schedule.profile_id
      })
      .then(await function(list_of_schedules){
        // Walks on the schedules list and count the amount of hours
        list_of_schedules.forEach(function(time){
          console.log('Parcial: {}'.format(current_amount_of_week_work_hours));
          current_amount_of_week_work_hours = (
            current_amount_of_week_work_hours +
            get_schedule_duration(
              time.start_time,
              time.end_time
              )
            )
        })

        var new_amount_of_week_work_hours = (
          current_amount_of_week_work_hours
          );
        var is_greater_than_sunday = first_day_of_week.getDate() < edited_schedule.start_time.getDate()
        var is_lower_than_saturday = last_day_of_week.getDate() > edited_schedule.start_time.getDate()
        if(is_greater_than_sunday && is_lower_than_saturday){
          new_amount_of_week_work_hours = (
            new_amount_of_week_work_hours +
            get_schedule_duration(
              edited_schedule.start_time,
              edited_schedule.end_time
              )
            )
          if (new_amount_of_week_work_hours > settings.max_hours_week){
            result.max_week_hours_limit_error = (
              'Você já tem {} horas nessa semana. O limite é de {} horas por semana'.format(
                new_amount_of_week_work_hours,
                settings.max_hours_week
                )
              );
          } else {
            // sucess!! nothing to do
          }
        }else {
          // Do nothing
        }
        console.log("Horas trabalhadas na semana: {}".format(current_amount_of_week_work_hours))
        console.log("Horas trabalhadas com o novo horário: {}".format(new_amount_of_week_work_hours))


        // validates if the amount of hours in a week is bigger than allowed
        if (new_amount_of_week_work_hours < settings.min_hours_week){
          result.min_week_hours_limit_error = (
            'O limite mínimo de horas por semana é de {}. Você possui apenas {} horas nessa semana'.format(
              settings.min_hours_week,
              new_amount_of_week_work_hours
              )
            );
        } else {
          // sucess!! nothing to do
        }
      })
      .catch(function(error){
        console.log('error');
        console.log(err);
      })


      // creates an interval of one month
      month = parseInt(current_schedule.start_time.getMonth());
      year = parseInt(current_schedule.start_time.getFullYear());
      start_of_month = new Date(year, month, 1);
      end_of_month = new Date(year, month+1, 1);
      var current_amount_of_month_work_hours = 0;

      await schedule_list$(
      {
        start_time: {
          $gte: start_of_month,
          $lt: end_of_month,
          $not:{$eq:current_schedule.start_time}
        },
        profile_id: current_schedule.profile_id
      })
      .then(await function(list_of_schedules){

        list_of_schedules.forEach(function(time){
          current_amount_of_month_work_hours = (
            current_amount_of_month_work_hours +
            get_schedule_duration(time.start_time, time.end_time)
            );
        })

        var new_amount_of_month_work_hours = current_amount_of_month_work_hours

        var is_greater_than_sunday = start_of_month.getDate() < edited_schedule.start_time.getDate()
        var is_lower_than_saturday = end_of_month.getDate() > edited_schedule.start_time.getDate()
        if(is_greater_than_sunday && is_lower_than_saturday){
          new_amount_of_month_work_hours = (
            new_amount_of_month_work_hours +
            get_schedule_duration(
              edited_schedule.start_time,
              edited_schedule.end_time
              )
            )
            // validates if the amount of hours in month is bigger than allowed
            if (new_amount_of_month_work_hours > settings.max_hours_month){
              result.max_hours_limit_error = (
                'Você já tem {} horas nesse mês. O limite é de {} horas por mês'.format(
                  current_amount_of_month_work_hours,
                  settings.max_hours_month
                  )
                );
            } else {
              //success
              //nothing to do
            }
          }else {
            // Do nothing
          }
        })
      .catch(function(error){
        console.log(error);
      })

      if(Object.entries(result).length > 0){
        result.success = false;
        console.log('Alguns erros foram encontrados...');
        console.log(result);
        respond(null, result);
      } else {
        edited_schedule.save$(function(err,schedule){
          respond(null, schedule);
        })
      }
    })

  // #############################################################################

  this.add('role:schedule, cmd:delete', async function (msg, respond) {
    var schedule = this.make(schedule_db);
    var schedule_id = msg.schedule_id;
    result = {}

    console.log("excluir:" + schedule_id);

    var remove$ = Promise.promisify(schedule.remove$, { context: schedule });

    await remove$({id: schedule_id})
    .then(function(deleted_schedule){
      if (deleted_schedule != null){
        deleted_schedule.sucess = true;
        respond(null, deleted_schedule);
      }else{
        result.sucess = false;
        result.schedule_not_find = "Horário não encontrado";
        respond(null, result);
      }
    })
    .catch(function(error){
      result.sucess = false;
      result.remove_error = "Erro ao remover horário";
      respond(null, result);
    })
  })

  // #############################################################################

  this.add('role:schedule, cmd:error', function error(msg, respond) {
    respond(null, { success: false, message: 'acesso negado' });
  })
}
