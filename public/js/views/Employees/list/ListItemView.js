﻿define([
    'Backbone',
    'Underscore',
    'text!templates/Employees/list/ListTemplate.html'
], function (Backbone, _, EmployeesListTemplate) {
    'use strict';
    var EmployeesListItemView = Backbone.View.extend({
        el: '#listTable',

        initialize: function (options) {
            this.collection = options.collection;
            this.page = options.page ? parseInt(options.page, 10) : 1;
            this.startNumber = (parseInt(this.collection.currentPage, 10) - 1) * this.collection.pageSize; // Counting the start index of list items
        },

        render: function () {
            this.$el.append(_.template(EmployeesListTemplate, {
                employeesCollection: this.collection.toJSON(),
                startNumber        : this.startNumber
            }));
        }
    });

    return EmployeesListItemView;
});
