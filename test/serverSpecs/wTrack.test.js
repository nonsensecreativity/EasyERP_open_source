require('../../config/development');

var request = require('supertest');
var expect = require('chai').expect;
var url = 'http://localhost:8089/';
var host = process.env.HOST;
var CONSTANTS = require('../../constants/constantsTest');
var aggent;

describe("wTrack Specs", function () {
    'use strict';

    var dateByWeek = 201602;

    describe('wTrack with admin', function () {

        before(function (done) {
            aggent = request.agent(url);
            aggent
                .post('users/login')
                .send({
                    login: 'admin',
                    pass : 'tm2016',
                    dbId : 'production'
                })
                .expect(200, done);
        });

        after(function (done) {
            aggent
                .get('logout')
                .expect(302, done);
        });

        describe("wTrack Creating", function () {

            var projectName;
            var id;
            var oTId;

            it("should create wTracks OR and OT", function (done) {
                var body = {
                    "1" : 12,
                    "2" : 12,
                    "3" : 10,
                    "4" : 8,
                    "5" : 8,
                    "6" : 0,
                    "7" : 0,
                    "worked" : 50,
                    "amount"     : 0,
                    "cost"       : 0,
                    "dateByMonth": 201602,
                    "dateByWeek" : 201607,
                    "department" : CONSTANTS.DEPARTMENT,
                    "employee"   : CONSTANTS.EMPLOYEE,
                    "jobs"       : CONSTANTS.JOB,
                    "month"      : 2,
                    "project"    : CONSTANTS.PROJECT,
                    "rate"       : 0,
                    "revenue"    : 0,
                    "week"       : 7,
                    "year"       : 2016
                };

                aggent
                    .post('wTrack')
                    .send(body)
                    .expect(200)
                    .end(function (err, res) {
                        var body = res.body;

                        if (err) {
                            return done(err);
                        }

                        expect(body)
                            .to.be.instanceOf(Array);
                        expect(body[0])
                            .to.have.property('_id');
                        expect(body[0])
                            .to.have.property('worked')
                            .and.to.be.equal(40);
                        expect(body[1])
                            .to.have.property('_id');
                        expect(body[1])
                            .to.have.property('worked')
                            .and.to.be.equal(10);

                        id = body[0]._id;

                        oTId = body[1]._id;

                        done();
                    });
            });

            it("should patch wTrack bulk", function (done) {
                var body = [{
                    "_id"        : id,
                    "cost"       : 0,
                    "dateByMonth": 201601,
                    "dateByWeek" : dateByWeek,
                    "month"      : "1",
                    "rate"       : 0,
                    "revenue"    : 0,
                    "week"       : "2",
                    "worked"     : 7,
                    "year"       : "2016"
                }];

                aggent
                    .patch('wTrack')
                    .send(body)
                    .expect(200, done);
            });

            it("should fail patch wTrack bulk", function (done) {
                var body = [{
                    _id : '123cba'
                }];

                aggent
                    .patch('wTrack')
                    .send(body)
                    .expect(500, done);

            });

            it("should get wTrack by viewType", function (done) {  // long query
                var query = {
                    viewType: "list",
                    count   : "100",
                    filter  : {
                        projectName: {
                            key  : "project._id",
                            type : "ObjectId"
                        }
                    }
                };

                aggent
                    .get('wTrack/list')
                    .query(query)
                    .query({"filter[projectName][value][0]": CONSTANTS.PROJECT})
                    .expect(200)
                    .end(function (err, res) {
                        var body = res.body;

                        if (err) {
                            return done(err);
                        }

                        expect(body)
                            .to.be.instanceOf(Array)
                            .and.to.have.deep.property('[0]')
                            .and.to.have.property('project')
                            .and.to.have.property('_id', CONSTANTS.PROJECT);
                        expect(body[0].project)
                            .to.have.property('projectName');
                        expect(body[0])
                            .to.have.property('department')
                            .and.to.have.property('_id');
                        expect(body[0])
                            .to.have.property('employee')
                            .and.to.have.property('_id');
                        expect(body[0])
                            .to.have.property('customer')
                            .and.to.have.property('_id');
                        expect(body[0])
                            .to.have.property('jobs')
                            .and.to.have.property('name');

                        projectName = body[0].project.projectName;

                        done();
                    });
            });

            it("should get wTracks for Projects", function (done) {
                var query = {
                    count: 100,
                    page : 1
                };
                aggent
                    .get('wTrack/getForProjects')
                    .query(query)
                    .expect(200)
                    .end(function (err, res) {
                        var body = res.body;

                        if (err) {
                            return done(err);
                        }

                        expect(body)
                            .to.be.instanceOf(Object)
                            .and.to.have.property('wTrack')
                            .and.to.be.instanceOf(Array)
                            .and.to.have.deep.property('[0]')
                            .and.to.have.property('_id');
                        expect(body)
                            .to.have.property('monthHours')
                            .and.to.be.instanceOf(Array)
                            .and.to.have.deep.property('[0]')
                            .and.to.have.property('_id');

                        done();
                    });
            });

            it("should get wTrack totalCollectionLength", function (done) {
                var query = {
                    filter: {
                        projectName: {
                            key  : "project._id",
                            type : "ObjectId"
                        }
                    }
                };

                aggent
                    .get('wTrack/totalCollectionLength')
                    .query(query)
                    .query({"filter[projectName][value][0]": CONSTANTS.PROJECT})
                    .expect(200)
                    .end(function (err, res) {
                        var body = res.body;

                        if (err) {
                            return done(err);
                        }

                        expect(body)
                            .to.be.instanceOf(Object);

                        expect(body)
                            .to.have.property('count')
                            .and.to.be.gte(1);

                        done();
                    });
            });

            it("should get wTrack for Dashboard Vacation", function (done) {
                var query = {
                    dateByWeek : dateByWeek,
                    employee   : CONSTANTS.EMPLOYEE,
                    projectName: projectName
                };

                aggent
                    .get('wTrack/dash')
                    .query(query)
                    .expect(200)
                    .end(function (err, res) {
                        var body = res.body;

                        if (err) {
                            return done(err);
                        }

                        expect(body)
                            .to.be.instanceOf(Object)
                            .and.to.have.property('customer')
                            .and.to.have.property('_id');
                        expect(body)
                            .to.have.property('wTracks')
                            .and.to.be.instanceOf(Array)
                            .and.to.have.deep.property('[0]')
                            .and.to.have.property('_id', id);

                        done();
                    });
            });

            it("should delete wTrack", function (done) {
                aggent
                    .delete('wTrack/' + id)
                    .expect(200, done);
            });

            it("should delete OTwTrack", function (done) {
                aggent
                    .delete('wTrack/' + oTId)
                    .expect(200, done);
            });

        });

        describe("wTrack Generating", function () {
            var wTrackId;
            var oTwTrackId;
            var jobsId;

            it("should generate wTracks", function (done) {
                var body = [{
                    "1"         : 8,
                    "2"         : 8,
                    "3"         : 8,
                    "4"         : 8,
                    "5"         : 8,
                    "6"         : 0,
                    "7"         : 0,
                    "department": CONSTANTS.DEPARTMENT,
                    "employee"  : CONSTANTS.EMPLOYEE,
                    "endDate"   : "",
                    "hours"     : 50,
                    "project"   : CONSTANTS.PROJECT,
                    "startDate" : "21 Feb, 2016"
                }];
                var headers = {
                    "createjob" : "true",
                    "project"   : CONSTANTS.PROJECT,
                    "jobname"   : "testJob"
                };

                aggent
                    .post('wTrack/generateWTrack')
                    .set(headers)
                    .send(body)
                    .expect(200)
                    .end(function (err, res) {
                        var body = res.text;

                        if (err) {
                            return done(err);
                        }

                        expect(body)
                            .to.be.equal('success');

                        done();
                    });
            });

            it("should get wTrack by ViewType", function (done) {
                var query = {
                    viewType: "list",
                    count   : "100",
                    filter  : {
                        projectName: {
                            key : "project._id",
                            type: "ObjectId"
                        },
                        week       : {
                            key : "week",
                            type: 'integer'
                        },
                        year       : {
                            key : "year",
                            type: 'integer'
                        },
                        department : {
                            key : "department._id",
                            type: 'ObjectId'
                        }
                    }
                };

                aggent
                    .get('wTrack/list')
                    .query(query)
                    .query({"filter[projectName][value][0]": CONSTANTS.PROJECT})
                    .query({"filter[week][value][0]": 8})
                    .query({"filter[year][value][0]": 2016})
                    .query({"filter[department][value][0]": CONSTANTS.DEPARTMENT})
                    .expect(200)
                    .end(function (err, res) {
                        var body = res.body;

                        if (err) {
                            return done(err);
                        }
                        expect(body)
                            .to.be.instanceOf(Array)
                            .and.to.have.deep.property('[0]')
                            .and.to.have.property('_id');
                        expect(body[0])
                            .to.have.property('jobs');

                        wTrackId = body[0]._id;
                        jobsId = body[0].jobs;

                        expect(body)
                            .to.be.instanceOf(Array)
                            .and.to.have.deep.property('[0]')
                            .and.to.have.property('project')
                            .and.to.have.property('_id', CONSTANTS.PROJECT);
                        expect(body[0].project)
                            .to.have.property('projectName');
                        expect(body[0])
                            .to.have.property('department')
                            .and.to.have.property('_id', CONSTANTS.DEPARTMENT);
                        expect(body[0])
                            .to.have.property('employee')
                            .and.to.have.property('_id');
                        expect(body[0])
                            .to.have.property('customer')
                            .and.to.have.property('_id');
                        expect(body[0])
                            .to.have.property('week', 8);
                        expect(body[0])
                            .to.have.property('year', 2016);

                        done();
                    });
            });

            it("should patch wTrack", function (done) {
                var body = {
                    "cost"       : 0,
                    "dateByMonth": 201601,
                    "dateByWeek" : dateByWeek,
                    "month"      : "1",
                    "rate"       : 0,
                    "revenue"    : 0,
                    "worked"     : 14,
                    "week"       : "2",
                    "year"       : "2016",
                    "1"          : 2,
                    "2"          : 4,
                    "3"          : 4,
                    "4"          : 4,
                    "5"          : 0,
                    "6"          : 0,
                    "7"          : 0
                };

                aggent
                    .patch('wTrack/' + wTrackId)
                    .send(body)
                    .expect(200, done);
            });

            it("should fail patch wTrack", function (done) {
                var body = {};

                aggent
                    .patch('wTrack/123cba')
                    .send(body)
                    .expect(500, done);

            });

            it("should get wTrack by ViewType for checking updating", function (done) {
                var query = {
                    viewType: "list",
                    filter  : {
                        projectName: {
                            key : "project._id",
                            type: "ObjectId"
                        },
                        week       : {
                            key : "week",
                            type: 'integer'
                        },
                        year       : {
                            key : "year",
                            type: 'integer'
                        },
                        department : {
                            key : "department._id",
                            type: 'ObjectId'
                        }
                    }
                };

                aggent
                    .get('wTrack/list')
                    .query(query)
                    .query({"filter[projectName][value][0]": CONSTANTS.PROJECT})
                    .query({"filter[week][value][0]": 2})
                    .query({"filter[year][value][0]": 2016})
                    .query({"filter[department][value][0]": CONSTANTS.DEPARTMENT})
                    .expect(200)
                    .end(function (err, res) {
                        var body = res.body;

                        if (err) {
                            return done(err);
                        }

                        expect(body)
                            .to.be.instanceOf(Array)
                            .and.to.have.deep.property('[0]')
                            .and.to.have.property('worked', 14);
                        expect(body[0])
                            .to.have.property('week', 2);
                        expect(body[0])
                            .to.have.property('month', 1);
                        expect(body[0])
                            .to.have.property('rate', 0);

                        done();
                    });
            });

            it("should delete wTrack", function (done) {
                aggent
                    .delete('wTrack/' + wTrackId)
                    .expect(200, done);
            });

            it("should delete job", function (done) {
                var body = {
                    _id: jobsId
                };

                aggent
                    .post('jobs/remove')
                    .send(body)
                    .expect(200)
                    .end(function (err, res) {
                        var body = res.body;

                        if (err) {
                            return done(err);
                        }

                        expect(body)
                            .to.be.instanceOf(Object);
                        expect(body)
                            .to.have.property('_id');
                        expect(body)
                            .to.have.property('project');

                        done();
                    });
            });

        });
    });

    describe('wTrack with user without a license', function () {

        before(function (done) {
            aggent = request.agent(url);

            aggent
                .post('users/login')
                .send({
                    login: 'ArturMyhalko',
                    pass : 'thinkmobiles2015',
                    dbId : 'production'
                })
                .expect(200, done);
        });

        after(function (done) {
            aggent
                .get('logout')
                .expect(302, done);
        });

        it("should fail create wTrack", function (done) {
            var body = {
                "amount"     : 0,
                "cost"       : 0,
                "dateByMonth": dateByWeek,
                "dateByWeek" : 201607,
                "department" : CONSTANTS.DEPARTMENT,
                "employee"   : CONSTANTS.EMPLOYEE,
                "jobs"       : CONSTANTS.JOB,
                "month"      : 2,
                "project"    : CONSTANTS.PROJECT,
                "rate"       : 0,
                "revenue"    : 0,
                "week"       : 32,
                "worked"     : 40,
                "year"       : 2016
            };

            aggent
                .post('wTrack')
                .send(body)
                .expect(403, done);
        });
    });

    describe('wTrack with no authorise', function () {

        it("should fail get wTrack for View", function (done) {

            aggent
                .get('wTrack/list')
                .expect(404, done);
        });

    });

});

