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
      cmd: "create",
      date: "09/04/2018",
      start_time: "06:00",
      end_time: "10:00",
      sector: "emergência",
      employee: "Gustavo",
      specialty: "Oncologista",
      amount_of_hours : 4,
      manager: true
    }, function(err, result){
      expect(result.sector).to.equal("emergência")
      fin()
    })
  })
});