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
      start_time: "2018-09-09T19:00",
      end_time: "2018-09-09T23:00",
      sector_id: "13",
      profile_id: "31",
    }, function(err, result){
      console.log(result);
      expect(result.sector_id).to.equal('13')
      expect(result.profile_id).to.equal('31')
      expect(result.start_time).to.equal('2018-09-09T19:00')
      expect(result.end_time).to.equal('2018-09-09T23:00')
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
      console.log(result);
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
      console.log(result);
      expect(result.max_hours_month).to.equal(150)
      expect(result.max_hours_week).to.equal(45)
      expect(result.min_hours_month).to.equal(50)
      expect(result.min_hours_week).to.equal(10)
      expect(result.templates).to.eql([1,2])
      fin()
    })
  })
});
