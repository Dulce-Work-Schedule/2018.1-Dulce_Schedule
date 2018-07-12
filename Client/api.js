
currentWeekNumber = require('current-week-number');


// The RegExp Object above validates MongoBD ObjectIds
function IsInvalidObjectId(objectIdString){
  var checkObjectId = new RegExp('^[0-9a-fA-F]{24}$');
  return (! checkObjectId.test(objectIdString))
}

function validate_date(date_field, result){
  date = new Date(date_field.value);
  today = new Date();
  if (date == "Invalid Date") {
    result[date_field.field_name + '_error'] = date_field.verbose + ' inválido';
  } else if (date < today){
    result[date_field.field_name + '_error'] = 'Você não pode inserir um ' + date_field.verbose + ' que já passou';
  }
  return result;
};

function validate_id(field, result){
  if (field.value == null || field.value == ''){
    result[field.field_name + '_error'] = 'O campo ' + field.verbose + ' é obrigatório.';
  } else if (IsInvalidObjectId(field.value)) {
    result[field.field_name + '_error'] = 'O ' + field.verbose +' é inválido.';
  }
  return result;
};

var milliseconds_in_one_hour = 3600000.0

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
      for (i = 0; i < replaceable_count; i++){
        new_string = new_string.replace('{}', arguments[i]);
      }
      return new_string
    }
  };
}

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

function api(options){

//#############################################################################
  this.add('role:api,path:create', function(msg, respond){
    // result variable store attribute errors or the success created schedule
    var result = {};

    // check if body is empty.
    if (msg.args.body == {}){
      result.body_error = 'Nenhum parametro informado';
      respond(null, result);
    }

    var sector_id = msg.args.body.sector_id;
    var profile_id = msg.args.body.profile_id;
    var start_time = null;
    var end_time = null;

    // validate start time
    if (msg.args.body.start_time == null) {
      result.start_time_null_error = 'Horário inicial não pode ser nulo';
      console.log(result.start_time_null_error);
    } else {
      start_time = new Date(msg.args.body.start_time);
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
      end_time = new Date(msg.args.body.end_time);
      if (end_time == "Invalid Date") {
        result.end_time_invalid_error = 'Horário final inválido';
        console.log(result.end_time_invalid_error);
      }
    }
    console.log();
    // validate sector id
    if (sector_id == null || sector_id == "") {
      result.sector_id_error = 'O setor é obrigatório';
      console.log(result.sector_id_error);
    } else if (IsInvalidObjectId(sector_id)) {
      result.invalid_sector_id_error = 'sector_id inválido'
    }

    // validate profile id
    if (profile_id == null || profile_id == "") {
      result.profile_id_error = 'O usuário é obrigatório';
      console.log(result.profile_id_error);
    } else if (IsInvalidObjectId(profile_id)) {
      result.invalid_profile_id_error = 'profile_id inválido'
    }
    // validade interval between start time and end time
    if((end_time - start_time) < 0){
      result.date_interval_error = 'O fim do horário deve ser maior que o início do horário'
      console.log(result.date_interval_error);
    }else if((end_time - start_time) == 0){
      result.date_equals_error = 'O horário de início e de fim não podem ser iguais'
      console.log(result.date_interval_error);
    }


    if (get_schedule_duration(start_time, end_time) > 24){
      result.schedule_bigger_than_limit_error = 'O horário deve ser de no máximo 1 dia';
      console.log(result.schedule_bigger_than_limit_error)
    }


    // verify that an error has occurred
    if (Object.entries(result).length > 0) {
      console.log("Result:");
      console.log(result);
      result.success = false;
      respond(null, result)
    // else, everything success
    } else {
      this.act('role:schedule,cmd:create',{
        start_time: start_time,
        end_time: end_time,
        sector_id: sector_id,
        profile_id: profile_id
      }, respond)
    }
  });

//#############################################################################
  this.add('role:api,path:createSettings', function(msg, respond){
    var max_hours_month = parseInt(msg.args.body.max_hours_month)
    var max_hours_week = parseInt(msg.args.body.max_hours_week)
    var min_hours_month = parseInt(msg.args.body.min_hours_month)
    var min_hours_week = parseInt(msg.args.body.min_hours_week)
    var max_hours_day = parseInt(msg.args.body.max_hours_day)
    var min_hours_schedule = parseInt(msg.args.body.min_hours_schedule)
    // Lista de ids de templates
    var templates = msg.args.body.templates

    var result = {}
    // validar se ids de templates são validos

    // 24*7 = 168
    var max_hours_in_a_week = 168;
    // 24*31 = 744
    var max_hours_in_a_month = 744;
    // 24h
    var max_hours_in_a_day = 24;

    // Validações de horas máximas por day
    if(isNaN(max_hours_day)){
      result.max_hours_day_NaN_error = 'O máximo de horas por dia deve ser um valor inteiro positivo';
      console.log(result.max_hours_day_NaN_error);
    } else if(max_hours_day <= 0){
      result.max_hours_day_negative_number_error = 'O máximo de horas por dia deve ser um valor positivo maior que zero';
      console.log(result.max_hours_day_negative_number_error);
    } else if(max_hours_day > max_hours_in_a_day){
      result.day_limit_error = 'O máximo de horas por dia não pode ser maior que ' + max_hours_in_a_day;
      console.log(result.day_limit_error);
    }

    // Validações de horas mínimas por semana
    if(isNaN(min_hours_schedule)){
      result.min_hours_schedule_NaN_error = 'O número mínimo de horas por dia deve ser um valor inteiro positivo';
    } else if(min_hours_schedule <= 0){
      result.min_hours_schedule_negative_number_error = 'O número mínimo de horas por dia deve ser um valor positivo maior que zero';
    } else if(min_hours_schedule > max_hours_in_a_day){
      result.day_limit_error = 'O mínimo de horas por dia não pode ser maior que ' + max_hours_in_a_day;
      console.log(result.day_limit_error);
    }

    // Validações de horas máximas por mês
    if(isNaN(max_hours_month)){
      result.max_hours_month_NaN_error = 'O máximo de horas por mês deve ser um valor inteiro positivo';
      console.log(result.max_hours_month_NaN_error);
    } else if(max_hours_month <= 0){
      result.max_hours_month_negative_number_error = 'O máximo de horas por mês deve ser um valor positivo maior que zero';
      console.log(result.max_hours_month_negative_number_error);
    } else if(max_hours_month >= max_hours_in_a_month){
      result.month_limit_error = 'O máximo de horas por mês não pode ser maior ou igual a ' + max_hours_in_a_month;
      console.log(result.month_limit_error);
    }

    // Validações de horas máximas por semana
    if(isNaN(max_hours_week)){
      result.max_hours_week_NaN_error = 'O máximo de horas por semana deve ser um valor inteiro positivo';
      console.log(result.max_hours_week_NaN_error);
    } else if(max_hours_week <= 0){
      result.max_hours_week_negative_number_error = 'O máximo de horas por semana deve ser um valor positivo maior que zero';
      console.log(result.max_hours_week_negative_number_error);
    } else if(max_hours_week >= max_hours_in_a_week){
      result.week_limit_error = 'O máximo de horas por semana não pode ser maior ou igual a ' + max_hours_in_a_week;
      console.log(result.week_limit_error);
    }

    // Validações de horas mínimas por mês
    if(isNaN(min_hours_month)){
      result.min_hours_month_NaN_error = 'O mínimo de horas por mês deve ser um valor inteiro positivo';
      console.log(result.min_hours_month_NaN_error);
    } else if(min_hours_month <= 0){
      result.min_hours_month_negative_number_error = 'O mínimo de horas por mês deve ser um valor positivo maior que zero';
      console.log(result.min_hours_month_negative_number_error);
    } else if(min_hours_month >= max_hours_in_a_month){
      result.month_limit_error = 'O mínimo de horas por mês não pode ser maior ou igual a ' + max_hours_in_a_month;
      console.log(result.month_limit_error);
    }

    // Validações de horas mínimas por semana
    if(isNaN(min_hours_week)){
      result.min_hours_week_NaN_error = 'O número mínimo de horas por semana deve ser um valor inteiro positivo';
    } else if(min_hours_week <= 0){
      result.min_hours_week_negative_number_error = 'O número mínimo de horas por semana deve ser um valor positivo maior que zero';
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

    // Validate interval limit
    if (max_hours_day <= min_hours_schedule) {
      result.hours_day_interval_invalid_error = 'O máximo de horas por dia deve ser maior que o mínimo de horas da escala';
      console.log(result.hours_week_interval_invalid_error);
    }
    if (Object.entries(result).length > 0) {
      console.log("Result:");
      console.log(result);
      result.success = false;
      respond(null, result)
    } else {
      this.act('role:schedule,cmd:createSettings',{
        max_hours_month:max_hours_month,
        max_hours_week:max_hours_week,
        min_hours_month:min_hours_month,
        min_hours_week:min_hours_week,
        min_hours_schedule: min_hours_schedule,
        max_hours_day:max_hours_day,
        templates:templates
      }, respond)
    }
  });

//#############################################################################

  this.add('role:api,path:listByProfile', function (msg, respond) {
      var profile_id = msg.args.query.profile_id;
      result = {success:false};
      if(IsInvalidObjectId(profile_id)){
        result.invalid_profile_id_error = "Perfil inválido"
        respond(null, result);
      }else{
        var currentDate = new Date();
        var year = parseInt(msg.args.query.year);
        if (isNaN(year) == true) {
            year = currentDate.getFullYear();
        }else{
          // Nothing to do
        }
        start_year = new Date(year, 0, 1);
        end_year = new Date((year+1), 0, 1);

        console.log("Start" + start_year);
        console.log("End" + end_year);
        this.act('role:schedule,cmd:listByProfile', {
            start_year:start_year,
            end_year:end_year,
            profile_id:profile_id
        }, respond)
      }
  });

//#############################################################################

  this.add('role:api,path:listBySector', function (msg, respond) {
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
    this.act('role:schedule,cmd:listBySector', {
        start_year:start_year,
        end_year:end_year,
        sector_id:sector_id
    }, respond)
  });

//#############################################################################

  this.add('role:api,path:changeListBySector', function (msg, respond) {
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
    var profile_id = msg.args.query.profile_id;
    this.act('role:schedule,cmd:changeListBySector', {
        start_year:start_year,
        end_year:end_year,
        sector_id:sector_id,
        profile_id:profile_id
    }, respond)
  });

//#############################################################################

  this.add('role:api,path:listByUser', function (msg, respond) {
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
    this.act('role:schedule,cmd:listByUser', {
        start_year:start_year,
        end_year:end_year,
        user_id:user_id
    }, respond)
  });

//#############################################################################
  this.add('role:api,path:edit', function(msg, respond){
    // result variable store attribute errors or the success created schedule
    var result = {};
    // check if body is empty.
    if (msg.args.body == {}){
      result.body_error = 'Nenhum parametro informado';
      respond(null, result);
    } else {
      // Do nothing
    }

    // variables
    var schedule_id = {
      verbose: 'ID do Horário',
      field_name: 'schedule_id'
    };
    var start_time = {
      verbose: 'Horário de início',
      field_name: 'start_time'
    };
    var end_time = {
      verbose: 'Horário de término',
      field_name: 'end_time'
    };

    schedule_id.value = msg.args.body.schedule_id;
    start_time.value = msg.args.body.start_time;
    end_time.value = msg.args.body.end_time;

    console.log("Client MSG");
    console.log(msg.args.body);

    result = validate_id(schedule_id, result);

    console.log("Client 1 ");
    console.log(result);
    console.log("Horáio 1 ");
    console.log(schedule_id);

    var new_start_time = null;
    var new_end_time = null;

    // validate start time
    if (start_time.value != null) {
      result = validate_date(start_time, result)
      new_start_time = new Date(start_time.value)
      console.log("Client 2 ");
      console.log(result);
      console.log("Date 1 ");
      console.log(new_start_time);
    } else {
      // All Good, do Nothing
    }
    // validate end time
    if (end_time.value != null) {
      result = validate_date(end_time, result)
      new_end_time = new Date(end_time.value)
      console.log("Date 2 ");
      console.log(new_end_time);
    } else {
      // All Good, do Nothing
    }

    if (new_start_time == null && new_end_time == null){
      result.no_change_error = "Nenhuma mudança detectada"
    }

    // verify that an error has occurred
    if (Object.entries(result).length > 0) {
      console.log("Result:");
      console.log(result);
      result.success = false;
      respond(null, result)
    // else, everything success
    } else {
      this.act('role:schedule,cmd:edit',{
        start_time: new_start_time,
        end_time: new_end_time,
        schedule_id : schedule_id.value
      }, respond)
    }
  });

//#############################################################################

  this.add('role:api,path:delete', function (msg, respond) {
    var schedule_id = msg.args.query.schedule_id;

    this.act('role:schedule,cmd:delete', {
        schedule_id:schedule_id
    }, respond)
  });

//#############################################################################

  this.add('role:api,path:error', function(msg, respond){
      this.act('role:schedule, cmd:error',{}, respond)
  });

//#############################################################################

  this.add('init:api', function (msg, respond) {
    this.act('role:web', {
      routes: {
        prefix: '/api/schedule',
        pin: 'role:api,path:*',
        map: {
          create: {
            POST: true
          },
          listByProfile: {
            GET: true
          },
          listBySector: {
            GET: true
          },
          changeListBySector: {
            GET: true
          },
          listByUser: {
            GET: true
          },
          edit: {
            PUT: true
          },
          delete: {
            DELETE: true
          },
          createSettings: {
            POST:true
          },
          error: {GET: true }
        }
      }
    }, respond)
  })
}
module.exports = api
