currentWeekNumber = require('current-week-number');


function get_schedule_duration(start_time, end_time){
  // The diference between timês is given in milliseconds. We are expecting hours,
  //so wu divide by 3600000.0 that is the number of milliseconds in 1 hour
  return duration = (end_time - start_time)/3600000.0
}
module.exports = function api(options){

//##############################################################################

  this.add('role:api,path:createSchedule', function(msg,respond){
    if (msg.args.body == {}){
      message.body.error = 'Nenhum parametro informado';
    }
    var sector_id = msg.args.body.sector_id
    var profile_id = msg.args.body.profile_id
    var start_time = null
    var end_time = null
    var result = {};

    // validate start time
    if (msg.args.body.start_time == null) {
      result.start_time_null_error = 'Horário inicial não pode ser nulo';
      console.log(result.start_time_null_error);
    } else {
      start_time = new Date(msg.args.body.start_time)
      if (start_time == "Invalid Date") {
        result.start_time_invalid_error = 'Horário inicial inválido';
        console.log(result.start_time_invalid_error);
      }
    }
    // validate end time
    if (msg.args.body.end_time == null) {
      result.end_time_null_error = 'Horário final não pode ser nulo';
      console.log(result.end_time_null_error);
    } else {
      end_time = new Date(msg.args.body.end_time)
      if (end_time == "Invalid Date") {
        result.end_time_invalid_error = 'Horário final inválido';
        console.log(result.end_time_invalid_error);
      }
    }
    // validate sector id
    if (sector_id == null || sector_id == "") {
      result.sector_id_error = 'O setor é obrigatório.';
      console.log(result.sector_id_error);
    } else if (Array.isArray(sector_id)) {
      result.multiple_sector_id_error = 'Só é permitido um setor';
      console.log(result.multiple_sector_id_error);
    }
    // validate profile id
    if (profile_id == null || profile_id == "") {
      result.profile_id_error = 'O usuário é obrigatório.';
      console.log(result.profile_id_error);
    } else if (Array.isArray(profile_id)) {
      result.profile_id_array_error = 'Só é permitido um perfil de usuário.';
      console.log(result.profile_id_array_error);
    }
    // validade interval between start time and end time
    if((end_time - start_time) < 0){
      result.date_interval_error = 'O fim do horário deve ser maior que o início do horário.'
      console.log(result.date_interval_error);
    }else if((end_time - start_time) == 0){
      result.date_equals_error = 'O horário de início e de fim não podem ser iguais.'
      console.log(result.date_interval_error);
    }
    // verify that an error has occurred
    if (Object.entries(result)[0]) {
      console.log("Result:");
      console.log(result);
      result.success = false;
      respond(null, result)
    // else, everything sucess
    } else {
      this.act('role:schedule,cmd:createSchedule',{
        start_time:start_time,
        end_time:end_time,
        sector_id:sector_id,
        profile_id:profile_id
      }, respond)
    }
  });

//##############################################################################

  this.add('role:api,path:createScheduleSettings', function(msg, respond){
    var max_hours_month = parseInt(msg.args.body.max_hours_month)
    var max_hours_week = parseInt(msg.args.body.max_hours_week)
    var min_hours_month = parseInt(msg.args.body.min_hours_month)
    var min_hours_week = parseInt(msg.args.body.min_hours_week)
    // Lista de ids de templates
    var templates = msg.args.body.templates

    result = {}
    // validar se ids de templates são validos

    // 24*7 = 168
    var max_hours_in_a_week = 168;
    // 24*31 = 744
    var max_hours_in_a_month = 744;

    // Validações de horas máximas por mês
    if(isNaN(max_hours_month)){
      result.max_hours_month_NaN_error = 'O máximo de horas por mês deve ser um valor inteiro positivo';
      console.log(result.max_hours_month_NaN_error);
    } else if(max_hours_month < 0){
      result.max_hours_month_negative_number_error = 'O máximo de horas por mês deve ser um valor positivo';
      console.log(result.max_hours_month_negative_number_error);
    } else if(max_hours_month >= max_hours_in_a_month){
      result.month_limit_error = 'O máximo de horas por mês não pode ser maior ou igual a ' + max_hours_in_a_month;
      console.log(result.month_limit_error);
    }

    // Validações de horas máximas por semana
    if(isNaN(max_hours_week)){
      result.max_hours_week_NaN_error = 'O máximo de horas por semana deve ser um valor inteiro positivo';
      console.log(result.max_hours_week_NaN_error);
    } else if(max_hours_week < 0){
      result.max_hours_week_negative_number_error = 'O máximo de horas por semana deve ser um valor positivo';
      console.log(result.max_hours_week_negative_number_error);
    } else if(max_hours_week >= max_hours_in_a_week){
      result.week_limit_error = 'O máximo de horas por semana não pode ser maior ou igual a ' + max_hours_in_a_week;
      console.log(result.week_limit_error);
    }

    // Validações de horas mínimas por mês
    if(isNaN(min_hours_month)){
      result.min_hours_month_NaN_error = 'O mínimo de horas por mês deve ser um valor inteiro positivo';
      console.log(result.min_hours_month_NaN_error);
    } else if(min_hours_month < 0){
      result.min_hours_month_negative_number_error = 'O mínimo de horas por mês deve ser um valor positivo';
      console.log(result.min_hours_month_negative_number_error);
    } else if(min_hours_month >= max_hours_in_a_month){
      result.month_limit_error = 'O mínimo de horas por mês não pode ser maior ou igual a ' + max_hours_in_a_month;
      console.log(result.month_limit_error);
    }

    // Validações de horas mínimas por semana
    if(isNaN(min_hours_week)){
      result.min_hours_week_NaN_error = 'O número mínimo de horas por semana deve ser um valor inteiro positivo';
    } else if(min_hours_week < 0){
      result.min_hours_week_negative_number_error = 'O número mínimo de horas por semana deve ser um valor positivo';
      respond(null, {success:false, message: 'O mínimo de horas por semana deve ser um valor positivo'})
    } else if(min_hours_week >= max_hours_in_a_week){
      result.week_limit_error = 'O mínimo de horas por semana não pode ser maior ou igual a ' + max_hours_in_a_week;
      console.log(result.week_limit_error);
    }

    // Validate interval limit
    if (min_hours_month <= min_hours_week) {
      result.min_hours_month_lte_min_hours_week_error = 'O mínimo de horas por mês deve ser maior que o mínimo de horas por semana';
      console.log(result.min_hours_month_lte_min_hours_week_error);
    }

    // Validate interval limit
    if (max_hours_month <= max_hours_week) {
      result.max_hours_month_lte_min_hours_week_error = 'O máximo de horas por mês deve ser maior que o mínimo de horas por semana';
      console.log(result.max_hours_month_lte_min_hours_week_error);
    }

    // Validate interval limit
    if (max_hours_month <= min_hours_month) {
      result.min_max_hours_month_interval_invalid_error = 'O mínimo de horas por mês deve ser menor que o máximo de horas por mês';
      console.log(result.min_max_hours_month_interval_invalid_error);
    }

    // Validate interval limit
    if (max_hours_week <= min_hours_week) {
      result.hours_week_interval_invalid_error = 'O máximo de horas por semana deve ser maior que o mínimo de horas por semana';
      console.log(result.hours_week_interval_invalid_error);
    }
    if (Object.entries(result)[0]) {
      console.log("Result:");
      console.log(result);
      result.success = false;
      respond(null, result)
    } else {
      this.act('role:schedule,cmd:createScheduleSettings',{
        max_hours_month:max_hours_month,
        max_hours_week:max_hours_week,
        min_hours_month:min_hours_month,
        min_hours_week:min_hours_week,
        templates:templates
      }, respond)
    }
  });

//##############################################################################

  this.add('role:api,path:listYearByProfile', function (msg, respond) {
      console.log(msg.args)
      var currentDate = new Date();
      var year = msg.args.query.year;
      if (year == undefined || year == "Invalid Date") {
          year = currentDate.getFullYear();
      }
      year = parseInt(year);
      start_year= new Date(year, 0, 1);
      end_year= new Date((year+1), 0, 1);

      console.log("Start" + start_year);
      console.log("End" + end_year);

      var profile_id = msg.args.query.profile_id;
      this.act('role:schedule,cmd:listYearByProfile', {
          start_year:start_year,
          end_year:end_year,
          profile_id:profile_id
      }, respond)
  });

//##############################################################################

  this.add('role:api,path:listYearBySector', function (msg, respond) {
    console.log(msg.args)
    var currentDate = new Date();
    var year = msg.args.query.year;
    if (year == undefined || year == "Invalid Date") {
        year = currentDate.getFullYear();
    }
    year = parseInt(year);
    start_year= new Date(year, 0, 1);
    end_year= new Date((year+1), 0, 1);

    console.log("Start" + start_year)
    console.log("End" + end_year)

    var sector_id = msg.args.query.sector_id;
    this.act('role:schedule,cmd:listYearBySector', {
        start_year:start_year,
        end_year:end_year,
        sector_id:sector_id
    }, respond)
  });

//##############################################################################

  this.add('role:api,path:listYearByUser', function (msg, respond) {
    console.log(msg.args)
    var currentDate = new Date();
    var year = msg.args.query.year;
    if (year == undefined || year == "Invalid Date") {
        year = currentDate.getFullYear();
    }
    year = parseInt(year);
    start_year= new Date(year, 0, 1);
    end_year= new Date((year+1), 0, 1);

    console.log("Start" + start_year)
    console.log("End" + end_year)

    var user_id = msg.args.query.user_id;
    this.act('role:schedule,cmd:listYearByUser', {
        start_year:start_year,
        end_year:end_year,
        user_id:user_id
    }, respond)
  });

//##############################################################################

  this.add('role:api,path:listByProfile', function (msg, respond) {
    var id = msg.args.query.id
    console.log("id informado:" + id);
    this.act('role:schedule, cmd:listByProfile', {
      id:id
    }, respond)
  });

//##############################################################################

  this.add('role:api,path:error', function(msg, respond){
      this.act('role:schedule, cmd:error',{}, respond)
  });

//##############################################################################

  this.add('init:api', function (msg, respond) {
    this.act('role:web', {
      routes: {
        prefix: '/api/schedule',
        pin: 'role:api,path:*',
        map: {
          createSchedule: {
            POST: true
          },
          listByProfile: {
            GET: true
          },
          listYearByProfile: {
            GET: true
          },
          listYearBySector: {
            GET: true
          },
          listYearByUser: {
            GET: true
          },
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
