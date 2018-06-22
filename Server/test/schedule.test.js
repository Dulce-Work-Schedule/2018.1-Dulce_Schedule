var Seneca = require('seneca')
var assert = require('assert')
var chai = require('chai')


var expect = chai.expect;

function test_schedule_seneca (fin){
  return Seneca({log: 'test'})
  .test(fin)

  .use("entity")
  .use(require('../plg_schedule'))
}

describe('Create schedule', function() {

  it('Schedule entity creation', function(fin){
    var seneca = test_schedule_seneca(fin)

    seneca.act({
      role: "schedule",
      cmd: "createSchedule",
      start_time: "2018-09-09T20:00",
      end_time: "2018-09-09T22:00",
      sector_id: "121212121212121212121212",
      profile_id: "131313131313131313131313",
    }, function(err, result){
      expect(result.sector_id).to.equal("121212121212121212121212")
      expect(result.profile_id).to.equal('131313131313131313131313')
      expect(result.start_time).to.eql(new Date('2018-09-09T20:00'))
      expect(result.end_time).to.eql(new Date('2018-09-09T22:00'))
      fin()
    })
  })
});

describe('Create schedule settings', function() {

  it('Schedule Settings entity creation', function(fin){
    var seneca = test_schedule_seneca(fin)

    seneca.act({
      role: "schedule",
      cmd: "createScheduleSettings",
      max_hours_month: 150,
    	max_hours_week: 45,
    	min_hours_month: 50,
    	min_hours_week: 10,
    	templates: [1,2]
    }, function(err, result){
      expect(result.max_hours_month).to.equal(150)
      expect(result.max_hours_week).to.equal(45)
      expect(result.min_hours_month).to.equal(50)
      expect(result.min_hours_week).to.equal(10)
      expect(result.templates).to.eql([1,2])
      fin()
    })
  }),
  it('Schedule Settings entity creation valid with string parameters', function(fin){
    var seneca = test_schedule_seneca(fin)

    seneca.act({
      role: "schedule",
      cmd: "createScheduleSettings",
      max_hours_month: "150",
      max_hours_week: "45",
      min_hours_month: "50",
      min_hours_week: "10",
      templates: [1,2]
    }, function(err, result){
      expect(result.max_hours_month).to.equal(150)
      expect(result.max_hours_week).to.equal(45)
      expect(result.min_hours_month).to.equal(50)
      expect(result.min_hours_week).to.equal(10)
      expect(result.templates).to.eql([1,2])
      fin()
    })
  })
});

describe('List schedules by profile', function() {
  it('Lists the correct schedule for the profile', function(fin) {
    var seneca = test_schedule_seneca(fin)

    seneca.act({
      role: "schedule",
      cmd: "createSchedule",
      start_time: "2018-09-09T19:00",
      end_time: "2018-09-09T23:00",
      sector_id: "121212121212121212121212",
      profile_id: "131313131313131313131313",
    }, function(err, result){
      seneca.act({
        role: "schedule",
        cmd: "listByProfile",
        id: "131313131313131313131313",
      }, function(err, result) {
        expect(result[0].sector_id).to.equal('121212121212121212121212')
        expect(result[0].profile_id).to.equal('131313131313131313131313')
        expect(result[0].start_time).to.eql(new Date('2018-09-09T19:00'))
        expect(result[0].end_time).to.eql(new Date('2018-09-09T23:00'))
        fin()
        })
    })
  })
});

// describe('List schedules by profile in a year', function() {
//   it('Lists the schedules for a profile in a given year', function(fin) {
//     var seneca = test_schedule_seneca(fin)
//
//     var start_time = new Date("2018-09-09T19:00")
//     var end_time = new Date("2018-09-09T23:00")
//     var sector_id = "121212121212121212121212"
//     var profile_id = "131313131313131313131313"
//
//     var year = parseInt(start_time.getFullYear());
//     var start_year = new Date(year+1, 0, 1);
//     var end_year = new Date((year+2), 0, 1);
//
//     seneca.act({
//       role: "schedule",
//       cmd: "createSchedule",
//       start_time: "2018-09-09T19:00",
//       end_time: "2018-09-09T23:00",
//       sector_id: "121212121212121212121212",
//       profile_id: "131313131313131313131313",
//     }, function(err, result){
//       console.log("First result:")
//       console.log(result)
//       console.log(start_year)
//       console.log(end_year)
//       seneca.act({
//         role: "schedule",
//         cmd: "listYearByProfile",
//         start_year: start_year,
//         end_year: end_year,
//         profile_id: profile_id,
//       }, function(err, response) {
//         console.log("listYearByProfileResult:")
//         console.log(response)
//         console.log("listYearByProfileEndResult:")
//         expect(response[0].sector_id).to.equal("121212121212121212121212")
//         expect(response[0].profile_id).to.equal('131313131313131313131313')
//         expect(response[0].start_time).to.eql(start_time)
//         expect(response[0].end_time).to.eql(end_time)
//         fin()
//         })
//     })
//   })
// });

// describe('List schedules by sector in a year', function() {
//   it('Lists the schedules for a sector in a given year', function(fin) {
//     var seneca = test_schedule_seneca(fin)
//
//     var start_time = new Date("2018-09-09T19:00")
//     var end_time = new Date("2018-09-09T23:00")
//     var sector_id = "121212121212121212121212"
//     var profile_id = '131313131313131313131313'
//
//     var year = parseInt(new Date().getFullYear());
//     var start_year = new Date(year, 0, 1);
//     var end_year = new Date((year+1), 0, 1);
//
//     seneca.act({
//       role: "schedule",
//       cmd: "createSchedule",
//       start_time: start_time,
//       end_time: end_time,
//       sector_id: sector_id,
//       profile_id: profile_id,
//     }, function(err, result){
//       console.log("listYearBySectorResult:")
//       console.log(result)
//       console.log("listYearBySectorEndResult:")
//       console.log(start_year)
//       console.log(end_year)
//       seneca.act({
//         role: "schedule",
//         cmd: "listYearBySector",
//         start_year: start_year,
//         end_year: end_year,
//         sector_id: sector_id,
//       }, function(err, response) {
//         console.log("Result:")
//         console.log(response)
//         expect(response[0].sector_id).to.equal("121212121212121212121212")
//         expect(response[0].profile_id).to.equal('131313131313131313131313')
//         expect(response[0].start_time).to.eql(start_time)
//         expect(response[0].end_time).to.eql(end_time)
//         fin()
//         })
//     })
//   })
// });
