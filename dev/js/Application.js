var Application;

(function(){
    
    if(typeof(Application) === 'function'){
        return;
    }
    
    Application = function Application(config){
        
        var me = this,
            initted = false,
            unoverride = [];
        
        config = config && typeof(config) === 'object' ? config : {};

        Application.Module = function Module (namespace, config){
            
            if(typeof(namespace) === 'string') this._namespace_ = namespace;
            else throw 'Namespace inválido.';
            
            this._appRoot_ = me;
            
            this.hasProperty = function (property){
                return this.hasOwnProperty(property);
            };
            
            this.callSuper = function(args){

                var methodName = arguments.callee.caller._name_,
                    owner = arguments.callee.caller._owner_;

                if(owner._super_ === null) throw 'O módulo "'+owner._namespace_+'" não herdou de nenhum outro módulo.';
                if(typeof(owner._super_[methodName]) !== 'function') throw 'O módulo "'+this._namespace_+'" não herdou nenhum metodo chamado "'+methodName+'" de "'+owner._super_._namespace_+'".';

                return owner._super_[methodName].apply(this, args);
            };
            
            this.apply = function(cfg, override){
                override = typeof(override) !== 'undefined' &&  override ? true : false;
                for(var i in cfg){

                    if(unoverride.indexOf(i) >= 0) continue;

                    if(override || !this.hasProperty(i)){

                        if(typeof(cfg[i]) === 'function'){
                            cfg[i]._name_ = i;

                            if(typeof(cfg[i]._owner_) === 'undefined')
                                cfg[i]._owner_ = this;
                        }

                        this[i] = cfg[i];
                    }
                }
            };

            this.apply(config);
        };

        this.Base = new Application.Module('Base', {});
        this.Config = new Application.Module('Config', {});
        
        /**
         * Define um modulo
         * @param {String} namespace
         * @param {Object} config
         * @param {String} extend
         */
        this.define = function (namespace, config, extend){

            if(!namespace || typeof(namespace) !== 'string'){
                throw 'Namespace inválido.';
            }

            if(me.Config.modules.indexOf(namespace) < 0){
                throw 'Módulo não esperado.';
            }

            if(!config || typeof(config) !== 'object'){
                throw 'Configuração inválida';
            }

            extend = typeof(extend) === 'string' ? extend : null;

            namespace = namespace.split('.');
            var target = namespace.pop(),
                path = [],
                current = this;

            for(var i in namespace){

                path.push(namespace[i]);
                if(current[namespace[i]] instanceof Application.Module){
                    current = current[namespace[i]];
                }

                else{
                    current[namespace[i]] = new Application.Module(path.join('.'), {
                        _parent_: current
                    });
                    current = current[namespace[i]];
                }
            }

            if(current.hasOwnProperty(target)) {
                path.push(target);
                console.warn('O módulo "'+path.join('.')+'" já foi definido anteriormente.');
                return;
            }

            path.push(target);
            current[target] = new Application.Module(path.join('.'), {
                _parent_: current,
                _initial_: config,
                _super_: extend,
                _initted_: false
            });

            this.Config.modulesCounter++;
            if(this.Config.modules.length === this.Config.modulesCounter){
                this.constructor();
            }
        };
        
        /**
         * Busta e recupera a instancia de um modulo na aplicação
         * @param {String} namespace
         * @returns {Application.Base.Module}
         */
        this.get = function(namespace){
            
            if(!namespace || typeof(namespace) !== 'string'){
                throw 'Namespace inválido';
            }
            
            namespace = namespace.split('.');
            var target = namespace.pop(),
                current = this;

            for(var i in namespace){
                if(!current[namespace[i]]) return null;
                current = current[namespace[i]];
            }

            return current[target] ? current[target] : null;
        };
        
        /**
         * Contrutor de modulos
         * @param {String|NULL} namespace
         */
        this.constructor = function(namespace){
            
            if(initted) return;
            
            if(!namespace || typeof(namespace) !== 'string'){
                var modules = this.Config.modules;

                for(var i in modules){
                    this.constructor(modules[i]);
                }
                
                initted = true;
                var module = null;
                
                for(var i in modules){
                    module = this.get(modules[i]);
                    if(module === null) return;
                    if(!module._isAbstract_) module.ready();
                }
                
                this.Base.fireEvent('AppReady', document, [this]);
            }

            else{

                var module = this.get(namespace);
                if(module._initted_) return;
                
                if(module._super_ !== null){
                    module._super_ = this.get(module._super_);
                    if(!module._super_._initted_) this.constructor(module._super_._namespace_);
                    module.apply(module._super_);
                }
                
                if(typeof(module._initial_.init) !== 'function'){
                    module._initial_.init = function(){};
                }

                if(typeof(module._initial_.ready) !== 'function'){
                    module._initial_.ready = function(){};
                }
                
                if(typeof(module._initial_._isAbstract_) !== 'boolean'){
                    module._initial_._isAbstract_ = false;
                }
                
                module.apply(module._initial_, true);
                delete module._initial_;
                
                if(!module._isAbstract_) module.init();
                module._initted_ = true;
            }
        };
        
        /**
         * Configura o modulo Base
         */
        for(var i in this.Base) unoverride.push(i);
        
        this.Base.apply({
                        
            getTimeStamp: function (){
                var time = new Date();
                return time.getTime();
            },

            getBaseUrl: function(){

                var path = location.pathname.split('/'),
                basePath = '';

                for(var i = 1; i < path.length -1  ; i++)
                  basePath += '/'+path[i];

                return location.protocol+'//'+location.hostname+basePath;
            },
            
            fireEvent: function(eventName, element, data){
                
                /**
                 * TODO: Implementar isso para caso não exist jquery
                 */
                
                $(element).trigger(eventName, data);
            },
            
            loadScript: function(url){

                var head = document.getElementsByTagName('head')[0],
                    script = document.createElement('script');

                if(!(url instanceof this.Url)){
                    url = new this.Url(url);
                }

                script.type = 'text/javascript';
                url.setParam('_', this.getTimeStamp());
                script.src = url.toString();

                head.appendChild(script);
            },

            Url: function Url(url){

                if(typeof(url) !== 'string') throw 'A url deve ser uma string';

                this.originalUrl = url;
                this.params = {};
                this.totalParams = 0;
                this.hasDomain = false;
                this.isAbsolute = false;

                if(url.indexOf('//') === 0 || url.indexOf('http://') === 0 || url.indexOf('https://') === 0){
                    this.hasDomain = true;
                }

                else if(url[0] === '/'){
                    this.isAbsolute = true;
                }

                this.hasParam = function (key){
                    return this.params.hasOwnProperty(key);
                };

                this.getParam = function(key){
                    return this.hasParam(key) ?
                           this.params[key] : null;
                };

                this.setParam = function (key, value){
                    this.params[key] = value;
                    this.totalParams++;
                    return this;
                };

                this.unsetParam = function (key){
                    if(this.hasParam(key)){
                        delete this.params[key];
                    }

                    return this;
                };

                this.toString = function(){

                    var url,
                        params = '',
                        count = 1;

                    for (var i in this.params){

                        params += i+'='+(this.params[i] !== null ? this.params[i] : '');
                        if(count < this.totalParams){
                            params += '&';
                        }

                        count++;
                    }

                    if(this.hasDomain){
                        url = this.url;
                    }

                    else if (this.isAbsolute){
                        url = this.url;
                    }

                    else{
                        url = me.Base.getBaseUrl()+'/'+this.url;
                    }


                    return url+(params !== '' ? '?'+params : '');
                };

                var u = url.split('?');
                this.url = u[0];

                var params = u[1];
                if(params){
                    params = params.split('&');
                    for(var i in params){

                        params[i] = params[i].split('=');

                        if(!params[i][0]) continue;
                        var key = params[i][0],
                            value = params[i][1] ? params[i][1] : null;

                        this.setParam(key, value);
                    }
                }
            }
        });
        
        /**
         * Configura o modulo Config
         */
        this.Config.apply({
            modules: config.hasOwnProperty('modules') && config.modules instanceof Array ? config.modules : [],
            modulesPath: config.hasOwnProperty('modulesPath') && typeof(config.modulesPath) === 'string' ? config.modulesPath : '',
            modulesCounter: 0
        });
        
        
        /**
         * Adiciona listener para quando a página estiver pronta
         */
        Application.ready(function(){
            var modules = me.Config.modules;
            for(var i in modules){
                if(me.get(modules[i]) === null)
                    me.Base.loadScript(new me.Base.Url(me.Config.modulesPath+modules[i].replace('.', '/')+'.js'));
            }
        });
    };
    
    /**
     * Configurando listener para o document.readyState
     */
    Application.readyHandles = [];
    
    Application.ready = function(callback){

        if(typeof(callback) !== 'function') return;

        if(typeof(jQuery) !== 'undefined') {
            jQuery(document).ready(callback);
            return;
        }

        if(document.readyState === 'complete'){
            callback();
            return;
        }

        Application.readyHandles.push(callback);
    };

    if(typeof(jQuery) === 'undefined'){

        if(typeof(document.onreadystatechange) === 'function'){
            Application.ready(document.onreadystatechange);
        }

        document.onreadystatechange = function(){
            if(document.readyState === 'complete'){
                for(var i in Application.readyHandles)
                    Application.readyHandles[i]();
            }
        };
    }
})();