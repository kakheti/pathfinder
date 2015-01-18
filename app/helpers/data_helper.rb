module DataHelper
  def render_data_menu(main_object, tabs)
    menu_data = [{ label: 'ზოგადი', tab: 'main', url: tab_url(main_object, 'main') }]
    tabs.each do |tab|
      cnt = main_object.send(tab.to_sym).count
      menu_data.append({ label: tab_label(tab), tab: tab, url: tab_url(main_object, tab), count: cnt })
    end
    render partial: '/data/menu', locals: { menu_data: menu_data }
  end

  private

  def tab_url(main_object, tab)
    if main_object.is_a?(Region)
      region_url(main_object, tab: tab)
    end
  end

  def tab_label(tab)
    case tab
    when 'offices' then 'ოფისები'
    when 'substations' then 'ქვესადგურები'
    when 'towers' then 'ანძები'
    when 'lines' then  'ხაზები'
    when 'tps' then 'სატრ.ჯიხურები'
    when 'poles' then 'ბოძები'
    when 'fiders' then 'ფიდერები'
    else tab
    end
  end
end
