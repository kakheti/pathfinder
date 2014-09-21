# -*- encoding : utf-8 -*-
require 'test_helper'

class Objects::TaskTest < ActiveSupport::TestCase
  def clear_db; make_clear_state end
  def create_user(username); Sys::User.create(username: username, password: "#{username}_secret", first_name: 'first', last_name: 'last', mobile: '599422451') end
  def add_tracking(user, lat, lng); Tracking::Path.add_point(user, lat, lng) end

  test 'create task and track it' do
    clear_db; user = create_user('dimitri')
    task = Task.create(assignee: user)
    assert_equal task.status, Task::START
    assert_equal 1, task.number

    task.begin ; task.reload
    assert task.in_progress?
    assert_equal task.paths.count, 0, 'no tracking information yet'

    add_tracking(user, 42, 42)
    add_tracking(user, 42, 43)
    add_tracking(user, 43, 43)
    task.reload

    assert_equal task.paths.count, 1, 'first track should appear'
    path = task.paths.first
    assert path.open, 'track should be in open state'
    assert_equal path.user, user
    assert_equal 3, path.points.count

    task.complete ; task.reload ; path.reload
    assert task.completed?
    refute path.open, 'track should be closed by then'

    task.begin
  end
end
