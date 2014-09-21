# -*- encoding : utf-8 -*-
module SearchHelper
  def search_form(search, opts = {})
    has_search = search.present? && search.values.any? { |x| x.present? and x != 'nil' }
    forma_for search, title: t('models.general.search'), icon: '/icons/magnifier.png', collapsible: true, collapsed: !has_search, method: 'get', model_name: 'search' do |f|
      yield f if block_given?
      f.submit t('models.general.search')
      f.bottom_action("#{URI(request.url).path}?search=clear", label: t('models.general.search_clear'), icon: '/icons/magnifier--minus.png') if has_search
    end
  end
end
