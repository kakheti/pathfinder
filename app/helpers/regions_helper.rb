# -*- encoding : utf-8 -*-
module RegionsHelper
  def region_form(region,opts={})
    title=region.new_record? ? 'ახალი რაიონი' : 'რაიონის შეცვლა'
    icon=region.new_record? ? '/icons/region--plus.png' : '/icons/region--pencil.png'
    cancel_url=region.new_record? ? regions_url : region_url(id: region.id)
    forma_for region, title: title, collapsible: true, icon: icon do |f|
      f.text_field 'name', required: true, autofocus: true
      f.text_field 'description'
      f.submit 'შენახვა'
      f.cancel_button cancel_url
    end
  end

  def region_view(region,opts={})
    title='რაიონის თვისებები'; icon='/icons/region.png'
    idx=case opts[:tab]
        when 'offices' then 1
        when 'substations' then 2
        when 'towers' then 3
        when 'lines' then 4
        when 'tps' then 5
        when 'poles' then 6
        when 'fiders' then 7
        else 0 end
    view_for region, title: title, collapsible: true, icon: icon, selected_tab: idx do |v|
      v.edit_action edit_region_url(id:region.id)
      v.delete_action delete_region_url(id:region.id)
      v.tab title: 'ზოგადი', icon:icon do |v|
        v.text_field 'name', required: true
        v.text_field 'description'
        v.text_field 'residential_count', tag: 'code', after: 'აბონენტი'
        v.text_field 'comercial_count', tag: 'code', after: 'აბონენტი'
        v.number_field 'usage_average', tag: 'code', after: 'კვტ.სთ.'
        v.timestamps
      end
      v.tab title: "ოფისები &mdash; <strong>#{region.offices.count}</strong>".html_safe, icon: '/icons/office.png' do |v|
        v.table_field 'offices', table: {title:'ოფისები', icon: '/icons/office.png'} do |field|
          field.table do |t|
            t.text_field 'kmlid', tag: 'code'
            t.text_field 'name', url: ->(x){objects_office_url(id:x.id)}
            t.text_field 'address'
            t.item_action ->(x){objects_office_url(id:x.id)}, icon: '/icons/eye.png'
          end
        end
      end
      v.tab title: "ქვესადგურები &mdash; <strong>#{region.substations.count}</strong>".html_safe, icon: '/icons/substation.png' do |v|
        v.table_field 'substations', table: {title:'ქვესადგურები', icon: '/icons/substation.png'} do |field|
          field.table do |t|
            t.text_field 'kmlid', tag: 'code'
            t.text_field 'name', url: ->(x){objects_substation_url(id:x.id)}
            t.text_field 'address'
            t.item_action ->(x){objects_substation_url(id:x.id)}, icon: '/icons/eye.png'
          end
        end
      end
      v.tab title: "ანძები &mdash; <strong>#{region.towers.count}</strong>".html_safe, icon: '/icons/tower.png' do |v|
        v.table_field 'towers_limited', table: {title:'ანძები', icon: '/icons/tower.png'} do |field|
          field.table do |t|
            t.text_field 'kmlid', tag: 'code'
            t.text_field 'name', url: ->(x){objects_tower_url(id:x.id)}
            t.item_action ->(x){objects_tower_url(id:x.id)}, icon: '/icons/eye.png'
          end
        end
      end
      v.tab title: "ხაზები &mdash; <strong>#{region.lines.count}</strong>".html_safe, icon: '/icons/line.png' do |v|
        v.table_field 'lines', table: {title:'ხაზები', icon: '/icons/line.png'} do |field|
          field.table do |t|
            t.text_field 'kmlid', tag: 'code'
            t.text_field 'name', url: ->(x){objects_line_url(id:x.id)}
            t.item_action ->(x){objects_line_url(id:x.id)}, icon: '/icons/eye.png'
          end
        end
      end
      v.tab title: "სატრ.ჯიხურები &mdash; <strong>#{region.tps.count}</strong>".html_safe, icon: '/icons/substation.png' do |v|
        v.table_field 'tps', table: {title:'სატრანსფორმატორი ჯიხურები', icon: '/icons/substation.png'} do |field|
          field.table do |t|
            t.text_field 'kmlid', tag: 'code'
            t.text_field 'owner'
            t.text_field 'name', url: ->(x){objects_tp_url(id:x.id)}
            t.text_field 'address'
            t.item_action ->(x){objects_tp_url(id:x.id)}, icon: '/icons/eye.png'
          end
        end
      end
      v.tab title: "ბოძები &mdash; <strong>#{region.poles.count}</strong>".html_safe, icon: '/icons/substation.png' do |v|
        v.table_field 'poles_limited', table: {title:'ბოძები', icon: '/icons/substation.png'} do |field|
          field.table do |t|
            t.text_field 'kmlid', tag: 'code'
            t.text_field 'name', url: ->(x){objects_pole_url(id:x.id)}
            t.text_field 'fider'
            t.item_action ->(x){objects_pole_url(id:x.id)}, icon: '/icons/eye.png'
          end
        end
      end
      v.tab title: "ფიდერები &mdash; <strong>#{region.fiders.count}</strong>".html_safe, icon: '/icons/substation.png' do |v|
        v.table_field 'fiders_limited', table: {title:'ფიდერები', icon: '/icons/substation.png'} do |field|
          field.table do |t|
            t.text_field 'kmlid', tag: 'code'
            t.text_field 'name', url: ->(x){objects_fider_url(id:x.id)}
            t.number_field 'length', after: 'კმ'
            t.item_action ->(x){objects_fider_url(id:x.id)}, icon: '/icons/eye.png'
          end
        end
      end
    end
  end
end
