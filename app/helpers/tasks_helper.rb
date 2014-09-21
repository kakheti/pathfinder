# -*- encoding : utf-8 -*-
module TasksHelper
  def tasks_table(tasks, opts={})
    table_for tasks, title: opts[:title]||'დავალებები', icon: '/icons/report-paper.png', collapsible: true do |t|
      t.edit_action ->(x){ tasks_edit_task_url(id: x.id) }
      t.delete_action ->(x){ tasks_delete_task_url(id: x.id) }, condition: ->(x){ x.can_delete? }
      t.text_field 'number', tag: 'code'
      t.date_field 'created_at', url: ->(x){ tasks_task_url(id:x.id) }, turbolink: false
      t.text_field 'status_name', i18n: 'status', icon: ->(x){ x.status_icon }
      t.text_field 'note'
      t.complex_field i18n: 'assignee' do |t|
        t.text_field 'assignee.username', tag: 'strong', url: ->(x){ admin_user_url(id: x.assignee.id) }
        t.text_field 'assignee.full_name'
      end
      t.paginate records: 'ჩანაწერი'
    end
  end

  def task_view(task, opts={})
    selected_tab = case opts[:tab] when 'sys' then 2 when 'notes' then 1 else 0 end
    view_for task, title: 'დავალების თვისებები', icon: '/icons/report-paper.png', collapsible: true, selected_tab: selected_tab do |f|
      f.edit_action tasks_edit_task_url(id: task.id)
      f.delete_action tasks_delete_task_url(id: task.id), condition: ->(x){ x.can_delete? }
      f.tab title: 'ძირითადი', icon: '/icons/report-paper.png' do |f|
        f.text_field 'number', required: true, tag: 'code'
        f.date_field 'created_at', required: true
        f.text_field 'status_name', required: true, i18n: 'status', icon: ->(x){ x.status_icon } do |f|
          f.action tasks_begin_task_url(id: task.id), label: 'დავალების დაწყება', icon: '/icons/status_in_progress.png', method: 'post', confirm: 'ნამდვილად გინდათ დავალების დაწყება?' if task.can_begin?
          f.action tasks_complete_task_url(id: task.id), label: 'დავალების დასრულება', icon: '/icons/status_completed.png', method: 'post', confirm: 'ნამდვილად გინდათ დავალების დასრულება?' if task.can_complete?
          f.action tasks_cancel_task_url(id: task.id), label: 'დავალების გაუქმება', icon: '/icons/status_canceled.png', method: 'post', confirm: 'ნამდვილად გინდათ დავალების გაუქმება?' if task.can_cancel?
        end
        f.complex_field i18n: 'assignee', required: true do |f|
          f.text_field 'assignee.username', tag: 'strong', url: admin_user_url(id: task.assignee.id)
          f.text_field 'assignee.full_name'
        end
        f.text_field 'note'
      end
      f.tab title: 'შენიშვნები', icon: '/icons/sticky-note.png' do |t|
        t.table_field 'notes', table: { title: 'შენიშვნები', icon: '/icons/sticky-note.png' } do |field|
          field.table do |t|
            t.text_field 'text'
            t.complex_field label: 'საფარი' do |c|
              c.text_field 'detail.surface.type.name', after: '&rarr;'.html_safe, url: ->(x){ objects_path_type_url(id: x.detail.surface.type.id) }
              c.text_field 'detail.surface.name', after: '&rarr;'.html_safe, url: ->(x){ objects_path_surface_url(id: x.detail.surface.id) }
              c.text_field 'detail.name', tag: 'strong', url: ->(x){ objects_path_detail_url(id: x.detail.id) }
            end
            t.complex_field label: 'კოორდინატები' do |c|
              c.text_field 'easting', tag: 'code', before: 'E:'
              c.text_field 'northing', tag: 'code', before: 'N:'
            end
          end
        end
      end
      f.tab title: 'სისტემური',icon:'/icons/traffic-cone.png' do |f|
        f.timestamps
      end
    end
  end

  def task_form(task, opts={})
    title=opts[:title]
    icon='/icons/report-paper.png'
    forma_for task, title: title, icon: icon, collapsible: true do |f|
      f.combo_field 'assignee_id', collection: Sys::User.where(active: true), empty: false, i18n: 'assignee', required: true
      f.text_field 'note', width: 600, autofocus: true
      f.submit 'შენახვა'
      f.cancel_button tasks_task_url(id: task.id), turbolink: false
    end
  end
end
