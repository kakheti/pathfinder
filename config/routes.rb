# -*- encoding : utf-8 -*-
require 'sidekiq/web'

Pathfinder::Application.routes.draw do
  mount Sidekiq::Web => '/sidekiq'

  scope controller: 'site' do
    get '/', action: 'index', as: 'home'
    match '/login', action: 'login', as: 'login', via: ['get','post']
    get '/logout', action: 'logout'
  end

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
      match '/upload_photo/:id', action: 'upload_photo', via: ['get', 'post'], as: 'upload_tower_photo'
      delete '/delete_photo/:id', action: 'delete_photo', as: 'delete_tower_photo'
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
    scope '/maps', controller: 'maps' do
      get '/editor', action: 'editor', as: 'map_editor'
      get '/viewer', action: 'viewer', as: 'map_viewer'
      match 'generate_images', action: 'generate_images', as: 'generate_images', via: ['get', 'post']
    end
  end

  namespace 'api' do
  end

  root 'site#index'
end
