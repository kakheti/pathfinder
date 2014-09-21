# -*- encoding : utf-8 -*-
module DownloadsHelper
  def android_button
    version = Pathfinder::LATEST_APK_VERSION
    %Q{
      <a href="/downloads/pathfinder-v#{
      version}.apk" class="btn btn-default btn-sm">
        <i class="fa fa-android"></i> Android აპლიკაცია (v#{version})
      </a>
    }.html_safe
  end
end
