# -*- encoding : utf-8 -*-
module Forms::Sys::UserHelper
  def sys_user_form(user,opts={})
    title=user.new_record? ? t('models.sys_user._actions.new_user') : t('models.sys_user._actions.edit_user')
    icon=user.new_record? ? '/icons/user--plus.png' : '/icons/user--pencil.png'
    cancel_url=user.new_record? ? admin_users_url : admin_user_url(id:user.id)
    forma_for user, title:title, collapsible:true, icon: icon do |f|
      f.text_field 'username', required:true, autofocus:true, readonly: !user.new_record?
      f.password_field 'password', required:user.new_record?
      f.text_field 'first_name', required:true
      f.text_field 'last_name', required:true
      f.text_field 'mobile', required:true
      f.boolean_field 'active', required:true unless user.new_record?
      f.boolean_field 'admin', required:true unless user.new_record?
      f.boolean_field 'editor', required: true
      f.boolean_field 'all_regions', required: true
      f.submit t('models.general._actions.save')
      f.cancel_button cancel_url
    end
  end

  def sys_user_view(user,opts={})
    title=t('models.sys_user._actions.user_properties')
    icon='/icons/user.png'
    tab=case opts[:tab] when 'regions' then 1 when 'sys' then 2 else 0 end
    view_for user, title:title, icon:icon, collapsible:true, selected_tab:tab do |f|
      f.edit_action admin_edit_user_url(id:user.id)
      f.delete_action admin_destroy_user_url(id:user.id)
      f.tab title: t('models.general.general_properties'), icon:icon do |f|
        f.text_field 'username', required: true, tag: 'code'
        f.text_field 'full_name', required: true
        f.text_field 'formatted_mobile', required: true, tag: 'code', i18n: 'mobile'
        f.boolean_field 'active', required: true
        f.boolean_field 'admin', required: true
        f.boolean_field 'editor', required: true
        f.boolean_field 'all_regions', required: true
      end
      table_opts={ title: "რაიონები &mdash; <strong>#{user.regions.count}</strong>".html_safe, icon:'/icons/region.png' }
      f.tab table_opts do |t|
        t.table_field :regions, table: table_opts do |tbl|
          tbl.table do |t|
            t.title_action admin_user_add_region_url(id:user.id), label: 'რაიონის დამატება', icon: '/icons/plus.png'
            t.delete_action ->(x){ admin_user_remove_region_url(id:user.id,role_id:x.id) }
            t.text_field 'name', url:->(x){ region_url(id: x.id) }
            t.text_field 'description', class:'text-muted'
          end
        end
      end
      f.tab title:t('models.general.system_properties'), icon:system_icon do |f|
        f.timestamps
        # f.userstamps
      end
    end
  end
end
