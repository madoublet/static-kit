/**
 * Displays a list of pages
 * @author: Matthew Smith
 */
var admin = (function () {

    'use strict';

    return {

        // properties
        listLoaded: false,
        list: null,

        listURL: '/api/pages/list/details',
        saveURL: '/api/pages/settings',

        /**
         * Setup app
         */
        setup: function(){

            fetch(hashedit.app.authUrl, {
                    credentials: 'include'
                })
                .then(function(response) {

                    if (response.status !== 200) {

                        // show authorization
                        hashedit.app.showAuth();

                    } else {

                        // create list
                        admin.createList();

                        // setup events
                        admin.setupListEvents();

                        // setup drawer
                        hashedit.app.setupDrawer();

                    }

                });

        },

        /**
         * Handles list events
         */
        setupListEvents: function(){

            var x, i, wrapper, drawer, html, list, item, items, card, details, params, html, xhr, cancel;

            // handle cancel
            cancel = document.querySelector('[hashedit-cancel-modal]');

            cancel.addEventListener('click',  function(e){
                document.getElementById('hashedit-form').removeAttribute('visible');
            });

            // handle click on images list
            list = document.getElementById('hashedit-list');

            ['click'].forEach(function(e) {

                list.addEventListener(e, function(e) {

                    item = e.target;

                    if (e.target.hasAttribute('data-index') === false) {
                        item = admin.findParentBySelector(e.target, '.hashedit-list-item');
                    }

                    // clear other active items
                    items = document.querySelectorAll('.hashedit-list-item[active]');

                    for(x=0; x<items.length; x++){
                        items[x].removeAttribute('active');
                    }

                    // set active
                    item.setAttribute('active', '');

                    if (item.hasAttribute('data-index') === true) {
                        i = item.getAttribute('data-index');

                        details = document.getElementById('hashedit-details-list');
                        params = admin.list[i].params;


                        html = '';
                        details.innerHTML = '';

                        for(x = 0; x < params.length; x++){
                            html += '<div class="hashedit-list-item"><label>' + params[x].label + '</label>';
                            html += '<span>' + params[x].value + '</span>';
                            html += '</div>';
                        }

                        details.innerHTML = html;

                        // show modal
                        document.getElementById('hashedit-form').setAttribute('visible', '');
                    }

                });

            });

        },

        /**
         * Creates the list
         */
        createList: function(){

            var list, item, html, x;

            console.log('[form-kit] create list');

            // fetch list from server
            fetch(admin.listURL, {
                credentials: 'include'
            })
            .then(function(response) {

                return response.json();

            }).then(function(json) {

                // set list to value
                admin.list = json;

                list = document.getElementById('hashedit-list');
                list.innerHTML = '';

                for (x = 0; x < json.length; x += 1) {
                    item = document.createElement('div');

                    if(json[x].image != ''){
                        item.setAttribute('class', 'hashedit-list-item hashedit-has-image');
                    }
                    else{
                        item.setAttribute('class', 'hashedit-list-item');
                    }

                    item.setAttribute('read', json[x].read);

                    // create html
                    html = '<h2>' + json[x].title + '</h2>';
                    html += '<small>' + json[x].url + '</small>';
                    html += '<p>' + json[x].description + '</p>';

                    if(json[x].image != ''){
                        html += '<div class="image" style="background-image: url(' + json[x].image + ')"></div>';
                    }

                    html += '<div class="hashedit-list-actions"><a hashedit-remove-page>Remove</a> <a hashedit-page-settings>Settings</a> <a href="' + json[x].editUrl + '" class="primary">Edit</a></div>';

                    item.innerHTML = html;
                    item.setAttribute('data-id', json[x].id);
                    item.setAttribute('data-index', x);

                    list.appendChild(item);
                }

                admin.listLoaded = true;

            }).catch(function(ex) {
                console.log('parsing failed', ex);
            });


        },

        /**
         * Find the parent by a selector ref: http://stackoverflow.com/questions/14234560/javascript-how-to-get-parent-element-by-selector
         * @param {Array} config.sortable
         */
        findParentBySelector: function(elm, selector) {
            var all, cur;

            all = document.querySelectorAll(selector);
            cur = elm.parentNode;

            while (cur && !admin.collectionHas(all, cur)) { //keep going up until you find a match
                cur = cur.parentNode; //go up
            }
            return cur; //will return null if not found
        },

        /**
         * Helper for findParentBySelecotr
         * @param {Array} config.sortable
         */
        collectionHas: function(a, b) { //helper function (see below)
            var i, len;

            len = a.length;

            for (i = 0; i < len; i += 1) {
                if (a[i] == b) {
                    return true;
                }
            }
            return false;
        }

    }
}());