module DataHelper
  def render_data_menu(main_object, tabs)
    current_tab = params[:tab] || 'main'
    menu_data = [{label: 'ზოგადი', tab: 'main', url: tab_url(main_object, 'main')}]
    tabs.each do |tab|
      cnt = main_object.send(tab.to_sym).count
      menu_data.append({label: tab_label(main_object, tab), tab: tab, url: tab_url(main_object, tab), count: cnt})
    end
    render partial: '/data/menu', locals: {menu_data: menu_data, current_tab: current_tab}
  end

  def render_data(main_object)
    current_tab = params[:tab] || 'main'
    if current_tab == 'main'
      class_name = main_object.class.name.downcase.pluralize
      render partial: "/#{class_name.gsub('::', '/')}/main", locals: {data: main_object}
    else
      subobject_render(main_object, current_tab)
    end
  end

  private

  def tab_url(main_object, tab)
    if main_object.is_a?(Region)
      region_url(main_object, tab: tab)
    elsif main_object.is_a?(Objects::Substation)
      objects_substation_url(main_object, tab: tab)
    elsif main_object.is_a?(Objects::Line)
      objects_line_url(main_object, tab: tab)
    elsif main_object.is_a?(Objects::Fider)
      objects_fider_url(main_object, tab: tab)
    elsif main_object.is_a?(Objects::Tp)
      objects_tp_url(main_object, tab: tab)
    end
  end

  def tab_label(main_object, tab)
    case tab
      when 'offices' then
        'ოფისები'
      when 'substations' then
        'ქვესადგურები'
      when 'towers' then
        'ანძები'
      when 'lines' then
        (main_object.is_a?(Objects::Fider) ? '6-10კვ ფიდერის ხაზები' : 'გადამცემი ხაზები')
      when 'tps' then
        '6-10კვ სატრ.ჯიხურები'
      when 'poles' then
        '6-10კვ საყრდენები'
      when 'fiders' then
        '6-10კვ ფიდერები'
      when 'fider04s' then
        '0.4კვ ხაზები'
      when 'pole04s' then
        '0.4კვ ბოძები'
      else
        tab
    end
  end

  def subobject_render(main_object, tab)
    data = main_object.send(tab.to_sym).paginate(per_page: 15, page: params[:page])
    case tab
      when 'substations'
        render partial: '/objects/substations/table', locals: {data: data}
      when 'offices'
        render partial: '/objects/offices/table', locals: {data: data}
      when 'lines'
        if main_object.is_a?(Objects::Fider)
          render partial: '/objects/fiders/lines', locals: {data: data}
        else
          render partial: '/objects/lines/table', locals: {data: data}
        end
      when 'towers'
        render partial: '/objects/towers/table', locals: {data: data}
      when 'fiders'
        render partial: '/objects/fiders/table', locals: {data: data}
      when 'tps'
        render partial: '/objects/tps/table', locals: {data: data}
      when 'poles'
        render partial: '/objects/poles/table', locals: {data: data}
      when 'pole04s'
        render partial: '/objects/pole04s/table', locals: {data: data}
      when 'fider04s'
        render partial: '/objects/fider04s/table', locals: {data: data}
      else
        render partial: '/data/no_template'
    end
  end
end
