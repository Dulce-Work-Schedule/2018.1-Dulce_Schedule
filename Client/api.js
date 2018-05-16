currentWeekNumber = require('current-week-number');

module.exports = function api(options){

  this.add('role:api,path:create', function(msg,respond){

    var date = new Date(msg.args.body.date)
    var start_time = msg.args.body.start_time
    var end_time = msg.args.body.end_time
    var sector = msg.args.body.sector
    var employee = msg.args.body.employee
    var specialty = msg.args.body.specialty
    var id = msg.args.query.id

    var month = date.getMonth() + 1
    var year = date.getYear() + 1900

    // The diference between times is given in milliseconds. We are expecting hours,
    //so wu divide by 3600000.0 that is the number of milliseconds in 1 hour
    var amount_of_hours = (Date.parse(end_time) - Date.parse(start_time))/3600000.0

    if(Date.parse(start_time) > Date.parse(end_time)){
      this.act('role:schedule,cmd:create',{
      }, respond(null, {success:false, message: 'Horários de Inicio e Fim estão em comflito'}))
    }else if(sector == null || (sector.length < 1)){
      this.act('role:schedule,cmd:create',{
      }, respond(null, {success:false, message: 'Setor não pode ser vazio'}))
    }else if(employee == null || (employee.length < 1)){
      this.act('role:schedule,cmd:create',{
      }, respond(null, {success:false, message: 'Plantonista não pode ser vazio'}))

    }else{
      this.act('role:schedule,cmd:create',{
        date:date,
        start_time:start_time,
        end_time:end_time,
        sector:sector,
        employee:employee,
        specialty:specialty,
        amount_of_hours:amount_of_hours,
        id:id,
        month:month,
        year:year
      }, respond)
    }
  })

  this.add('role:api,path:listSchedule', function(msg, respond){
    this.act('role:schedule, cmd:listSchedule',{}, respond)

  });

  this.add('role:api,path:createScale', function(msg, respond){
    var maximum_hours_month = msg.args.body.maximum_hours_month
    var maximum_hours_week = msg.args.body.maximum_hours_week
    var minimum_hours_month = msg.args.body.minimum_hours_month
    var minimum_hours_week = msg.args.body.minimum_hours_week
    var employee = msg.args.body.employee
    var month = msg.args.body.month
    var year = msg.args.body.year
    var id = msg.args.query.id
    var amount_of_hours = 0
    var schedule_list = []

    this.act('role:schedule,cmd:createScale',{
      maximum_hours_month:maximum_hours_month,
      maximum_hours_week:maximum_hours_week,
      minimum_hours_month:minimum_hours_month,
      minimum_hours_week:minimum_hours_week,
      employee:employee,
      month:month,
      year:year,
      amount_of_hours:amount_of_hours,
      id:id
    }, respond)
});

    this.add('role:api,path:listDay', function (msg, respond) {
        var currentDate = new Date();
        var year = msg.args.query.year;
        var day = msg.args.query.day;
        var month = msg.args.query.month;
        if (year == undefined) {
            year = currentDate.getFullYear();
        } else {
            currentDate.setFullYear(year);
        }
        if (month == undefined) {
            month = currentDate.getMonth() + 1;
        } else {
            currentDate.setMonth(month);
        }
        if (day == undefined) {
            day = currentDate.getDate() - 1;
            day = JSON.stringify(day);
        }
        var id = msg.args.query.id;
        this.act('role:schedule,cmd:listDay', {
            day: day,
            id: id
        }, respond)
    });

    this.add('role:api,path:listMonth', function (msg, respond) {
        var currentDate = new Date();
        var year = msg.args.query.year;
        var month = msg.args.query.month;
        if (year == undefined) {
            year = currentDate.getFullYear();
        } else {
            currentDate.setFullYear(year);
        }
        if (month == undefined) {
            month = currentDate.getMonth() + 1;
            month = JSON.stringify(month);
        }

        var id = msg.args.query.id;
        this.act('role:schedule,cmd:listMonth', {
            month: month,
            id: id
        }, respond)
    });

    this.add('role:api,path:listSchedule', function (msg, respond) {
        this.act('role:schedule, cmd:listSchedule', {}, respond)

    });
    this.add('role:api,path:listYear', function (msg, respond) {
        var currentDate = new Date();
        var year = msg.args.query.year;
        if (year == undefined) {
            year = currentDate.getFullYear();
            year = JSON.stringify(year);
        }
        var id = msg.args.query.id;
        this.act('role:schedule,cmd:listYear', {
            year: year,
            id: id
        }, respond)
    });

    this.add('role:api,path:listWeek', function (msg, respond) {
        var currentDate = new Date();
        var year = msg.args.query.year;
        var day = msg.args.query.day;
        var month = msg.args.query.month;
        var week = msg.args.query.week;
        console.log(week);
        if (year == undefined) {
            year = currentDate.getFullYear();
        } else {
            currentDate.setFullYear(year);
        }
        if (month == undefined) {
            month = currentDate.getMonth() + 1;
        } else {
            currentDate.setMonth(month);
        }
        if (day == undefined) {
            day = currentDate.getDate() - 1;
        } else {
            currentDate.setDate(day);
        }
        if (week == undefined) {

            var week = currentWeekNumber(currentDate);

            week = JSON.stringify(week);

        }

        var id = msg.args.query.id;

        console.log(id);


        this.act('role:schedule,cmd:listWeek', {
            week: week,
            id: id
        }, respond)
    });


    this.add('role:api,path:listHourWeek', function (msg, respond) {
        var currentDate = new Date();
        var year = msg.args.query.year;
        var day = msg.args.query.day;
        var month = msg.args.query.month;
        var week = msg.args.query.week;

        if (year == undefined) {
            year = currentDate.getFullYear();
        } else {
            currentDate.setFullYear(year);
        }
        if (month == undefined) {
            month = currentDate.getMonth() + 1;
        } else {
            currentDate.setMonth(month);
        }
        if (day == undefined) {
            day = currentDate.getDate() - 1;
        } else {
            currentDate.setDate(day);
        }
        if (week == undefined) {

            var week = currentWeekNumber(currentDate);

            week = JSON.stringify(week);

        }

        var id = msg.args.query.id;


        this.act('role:schedule,cmd:listHourWeek', {
            week: week,
            id: id
        }, respond)
    });

    this.add('role:api,path:listSectorDay', function (msg, respond) {
        var day = msg.args.query.day;
        var sector = msg.args.query.sector;
        this.act('role:schedule,cmd:listSectorDay', {
            day: day,
            sector: sector
        }, respond)
    });

    this.add('role:api,path:listSectorMonth', function (msg, respond) {
        var month = msg.args.query.month;
        var sector =  msg.args.query.sector;
        this.act('role:schedule,cmd:listSectorMonth', {
            month: month,
            sector: sector
        }, respond)
    });

    this.add('role:api,path:listSectorYear', function (msg, respond) {
        var year = msg.args.query.year;
        var sector =  msg.args.query.sector;
        this.act('role:schedule,cmd:listSectorYear', {
            year: year,
            sector: sector
        }, respond)
    });

    this.add('role:api,path:listSectorWeek', function (msg, respond) {
        var currentDate = new Date();
        var year = msg.args.query.year;
        var day = msg.args.query.day;
        var month = msg.args.query.month;
        var week = msg.args.query.week;
        if(year == undefined){
            year = currentDate.getFullYear();
        }else {
            currentDate.setFullYear(year);
        }
        if(day == undefined){
            day = currentDate.getDate() - 1;
        }else {
            currentDate.setDate(day);
        }
        if(month == undefined){
            month = currentDate.getMonth() + 1;
        }else{
            currentDate.setMonth(month);
        }
        if(week == undefined){

        var week = currentWeekNumber(currentDate);

        week = JSON.stringify(week);

        }

        var sector =  msg.args.query.sector;


        this.act('role:schedule,cmd:listSectorWeek', {
            week: week,
            sector: sector
        }, respond)
    });


    this.add('role:api,path:error', function(msg, respond){
        this.act('role:schedule, cmd:error',{}, respond)
});


    this.add('init:api', function (msg, respond) {
        this.act('role:web', {
            routes: {
                prefix: '/api/schedule',
                pin: 'role:api,path:*',
                map: {
                    create: { POST: true,
                              auth: {
                                strategy: 'jwt',
                                fail: '/api/schedule/error'
                      }
                    },
                    listDay: {
                        GET: true,
                        auth: {
                            strategy: 'jwt',
                            fail: '/api/schedule/error'
                        }
                    },
                    listSchedule: {
                        GET: true,
                        auth: {
                            strategy: 'jwt',
                            fail: '/api/schedule/error'
                        }
                    },
                    listMonth: {
                        GET: true,
                        auth: {
                            strategy: 'jwt',
                            fail: '/api/schedule/error'
                        }
                    },
                    listYear: {
                        GET: true,
                        auth: {
                            strategy: 'jwt',
                            fail: '/api/schedule/error'
                        }
                    },
                    listWeek: {
                        GET: true,
                        auth: {
                            strategy: 'jwt',
                            fail: '/api/schedule/error'
                        }
                    },
                    listHourWeek: {
                        GET: true,
                        auth: {
                            strategy: 'jwt',
                            fail: '/api/schedule/error'
                        }
                    },
                    listSectorDay: { GET: true,
                      auth: {
                         strategy: 'jwt',
                         fail: '/api/schedule/error'
                       }
                     },
                    listSchedule: { GET: true,
                      auth: {
                         strategy: 'jwt',
                         fail: '/api/schedule/error'
                       }
                     },
                    listSectorMonth: { GET: true,
                      auth: {
                         strategy: 'jwt',
                         fail: '/api/schedule/error'
                       }
                     },
                    listSectorYear: { GET: true,
                      auth: {
                         strategy: 'jwt',
                         fail: '/api/schedule/error'
                       }
                     },
                     listSectorWeek: { GET: true,
                       auth: {
                           strategy: 'jwt',
                           fail: '/api/schedule/error'
                        }
                    },
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
