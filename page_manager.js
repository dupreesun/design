/**
 * Created by jf on 2015/9/11.
 */
var pageManager = {
     $container: $('.js_container'),
     _pageStack: [],
     _pages: [],
     _defaultPage: null,
     _pageIndex: 1,
     setDefault: function (defaultPage) {
         this._defaultPage = this._find('name', defaultPage);
         return this;
     },
     init: function () {
         var self = this;

         $(window).on('hashchange', function () {
             var state = history.state || {};
             var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
             var page = self._find('url', url) || self._defaultPage;
             if (state._pageIndex <= self._pageIndex || self._findInStack(url)) {
                 self._back(page);
             } else {
                 self._go(page);
             }
         });

         if (history.state && history.state._pageIndex) {
             this._pageIndex = history.state._pageIndex;
         }

         this._pageIndex--;

         var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
         var page = self._find('url', url) || self._defaultPage;
         this._go(page);
         return this;
     },
     push: function (page) {
         this._pages.push(page);
         return this;
     },
     go: function (to) {
         var page = this._find('name', to);
         if (!page) {
             return;
         }
         location.hash = page.url;
     },
     _go: function (page) {
         this._pageIndex ++;

         history.replaceState && history.replaceState({_pageIndex: this._pageIndex}, '', location.href);

         var html = $(page.html).html();
         var $html = $(html).addClass('slideIn').addClass(page.name);


         this.$container.append($html);

         this._pageStack.push({
             page: page,
             dom: $html
         });

         if (!page.isBind) {
             this._bind(page);
         }

         return this;
     },
     back: function () {
         history.back();
     },
     _back: function (page) {
         this._pageIndex --;

         var stack = this._pageStack.pop();
         if (!stack) {
             return;
         }

         var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
         var found = this._findInStack(url);
         if (!found) {
             var html = $(page.html).html();
             var $html = $(html).css('opacity', 1).addClass(page.name);
             $html.insertBefore(stack.dom);

             if (!page.isBind) {
                 this._bind(page);
             }

             this._pageStack.push({
                 page: page,
                 dom: $html
             });
         }

         stack.dom.addClass('slideOut').on('animationend', function () {
             stack.dom.remove();
         }).on('webkitAnimationEnd', function () {
             stack.dom.remove();
         });

         return this;
     },
     _findInStack: function (url) {
         var found = null;
         for(var i = 0, len = this._pageStack.length; i < len; i++){
             var stack = this._pageStack[i];
             if (stack.page.url === url) {
                 found = stack;
                 break;
             }
         }
         return found;
     },
     _find: function (key, value) {
         var page = null;
         for (var i = 0, len = this._pages.length; i < len; i++) {
             if (this._pages[i][key] === value) {
                 page = this._pages[i];
                 break;
             }
         }
         return page;
     },
     _bind: function (page) {
         var events = page.events || {};
         for (var t in events) {
             for (var type in events[t]) {
                 this.$container.on(type, t, events[t][type]);
             }
         }
         page.isBind = true;
     }
 };

$(function () {
    var page_home = {
        name: 'home',
        url: '#',
        html: '#tpl_home',
        events: {
            '.js_grid': {
                click: function (e) {
                    var id = $(this).data('id');
                    pageManager.go(id);
                }
            }
        }
    };
    var page_mary = {
        name: 'Mary',
        url: '#Mary',
        html: '#page_mary',
        events: {
            '#showDialog2': {
                click: function (e) {
                    var $dialog = $('#dialog2');
                    $dialog.show();
                    $dialog.find('.weui_btn_dialog').one('click', function () {
                        $dialog.hide();
                    });
                }
            }
        }        
    };
    var page_gonewind = {
        name: 'GoneWind',
        url: '#GoneWind',
        html: '#page_gonewind'
    };
    var page_onionegg = {
        name: 'OnionEgg',
        url: '#OnionEgg',
        html: '#page_onionegg'
    };    
    pageManager.push(page_home)
        .push(page_mary)
        .push(page_gonewind)
        .push(page_onionegg)
        .setDefault('home')
        .init();
});
