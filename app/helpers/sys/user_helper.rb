# -*- encoding : utf-8 -*-
module Sys::UserHelper
  def sys_admin?
    if Sys::User.count==0
      true
    elsif current_user and current_user.admin? then
      true
    else
      false
    end
  end
end
