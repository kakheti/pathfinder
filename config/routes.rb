# -*- encoding : utf-8 -*-
require 'sidekiq/web'

Pathfinder::Application.routes.draw do
  mount Sidekiq::Web => '/sidekiq'

  scope controller: 'site' do
    get '/', action: 'index', as: 'home'
    match '/login', action: 'login', as: 'login', via: ['get','post']
    get '/logout', action: 'logout'
  end

  get '/map', to: 'objects/maps#viewer'

  namespace 'account' do
    scope '/profile', controller: 'profile' do
      get '/', action: 'index', as: 'profile'
      match '/edit', action: 'edit', as: 'edit_profile', via:[:get,:post]
      match '/change_password', action: 'change_password', as: 'change_password', via:[:get,:post]
    end
  end

  namespace 'admin' do
    scope '/users', controller: 'users' do
      get '/', action: 'index', as: 'users'
      get '/show/:id', action: 'show', as: 'user'
      match '/new', action: 'new', as: 'new_user', via: ['get','post']
      match '/edit/:id', action: 'edit', as: 'edit_user', via: ['get','post']
      delete '/delete/:id', action: 'destroy', as: 'destroy_user'
      match '/add_region/:id', action: 'add_region', as: 'user_add_region', via: ['get', 'post']
      delete '/remove_region/:id', action: 'remove_region', as: 'user_remove_region'
    end
  end

  scope '/regions', controller: 'regions' do
    get '/', action: 'index', as: 'regions'
    get '/show/:id', action: 'show', as: 'region'
    match '/new', action: 'new', as: 'new_region', via: [:get, :post]
    match '/edit/:id', action: 'edit', as: 'edit_region', via: [:get, :post]
    delete '/delete/:id', action: 'delete', as: 'delete_region'
  end

  namespace 'objects' do
    scope '/towers', controller: 'towers' do
      get '/', action: 'index', as: 'towers'
      get '/show/:id', action: 'show', as: 'tower'
      match '/upload', action: 'upload', via: ['get','post'], as: 'upload_towers'
    end
    scope '/offices', controller: 'offices' do
      get '/', action: 'index', as: 'offices'
      get '/show/:id', action: 'show', as: 'office'
      match '/upload', action: 'upload', via: ['get', 'post'], as: 'upload_offices'
    end
    scope '/substations', controller: 'substations' do
      get '/', action: 'index', as: 'substations'
      get '/show/:id', action: 'show', as: 'substation'
      match '/upload', action: 'upload', via: ['get', 'post'], as: 'upload_substations'
    end
    scope '/lines', controller: 'lines' do
      get '/', action: 'index', as: 'lines'
      get '/show/:id', action: 'show', as: 'line'
      match '/upload', action: 'upload', via: ['get','post'], as: 'upload_lines'
    end
    scope '/tps', controller: 'tps' do
      get '/', action: 'index', as: 'tps'
      get '/show/:id', action: 'show', as: 'tp'
      match '/upload', action: 'upload', via: ['get','post'], as: 'upload_tps'
      match '/upload_stat', action: 'upload_stat', via: ['get', 'post'], as: 'upload_tpstat'
    end
    scope '/poles', controller: 'poles' do
      get '/', action: 'index', as: 'poles'
      get '/show/:id', action: 'show', as: 'pole'
      match '/upload', action: 'upload', via: ['get','post'], as: 'upload_poles'
    end
    scope '/pole04s', controller: 'pole04s' do
      get '/', action: 'index', as: 'pole04s'
      get '/show/:id', action: 'show', as: 'pole04'
      match '/upload', action: 'upload', via: ['get','post'], as: 'upload_pole04s'
    end
    scope '/fiders', controller: 'fiders' do
      get '/', action: 'index', as: 'fiders'
      get '/show/:id', action: 'show', as: 'fider'
      match '/upload', action: 'upload', via: ['get','post'], as: 'upload_fiders'
      get '/find/:name', action: 'find', as: 'find_fider'
    end
    scope '/fiderlines', controller: 'fiderlines' do
      get '/show/:id', action: 'show', as: 'fiderline'
    end
    scope '/fider04s', controller: 'fider04s' do
      get '/', action: 'index', as: 'fider04s'
      get '/show/:id', action: 'show', as: 'fider04'
      match '/upload', action: 'upload', via: ['get','post'], as: 'upload_fider04s'
      get '/find/:name', action: 'find', as: 'find_fider04'
    end
    scope '/direction04s', controller: 'direction04s' do
      get '/', action: 'index', as: 'direction04s'
      get '/show/:id', action: 'show', as: 'direction04'
      match '/upload', action: 'upload', via: ['get','post'], as: 'upload_direction04s'
      get '/find/:name', action: 'find', as: 'find_direction04s'
    end
    scope '/maps', controller: 'maps' do
      get '/viewer', action: 'viewer', as: 'map_viewer'
    end
  end

  namespace 'api' do
    scope '/towers', controller: 'towers' do
      get '/', action: 'index'
      get '/:id', action: 'info'
    end
    scope '/substations', controller: 'substations' do
      get '/', action: 'index'
      get '/:id', action: 'info'
    end
    scope '/tps', controller: 'tps' do
      get '/', action: 'index'
      get '/:id', action: 'info'
    end
    scope '/poles', controller: 'poles' do
      get '/', action: 'index'
      get '/:id', action: 'info'
    end
    scope '/pole04s', controller: 'pole04s' do
      get '/', action: 'index'
      get '/:id', action: 'info'
    end
    scope '/lines', controller: 'lines' do
      get '/', action: 'index'
      get '/:id', action: 'info'
    end
    scope '/fiders', controller: 'fiders' do
      get '/:id', action: 'info'
    end
    scope '/fider04s', controller: 'fider04s' do
      get '/:id', action: 'info'
    end
    scope '/fiderlines', controller: 'fiderlines' do
      get '/:id', action: 'info'
    end
    scope '/offices', controller: 'offices' do
      get '/:id', action: 'info'
    end
    scope '/regions', controller: 'regions' do
      get '/', action: 'index'
    end
    scope '/search', controller: 'search' do
      get '/', action: 'index'
      get '/by_name', action: 'by_name'
    end
  end

  root 'site#index'
end
