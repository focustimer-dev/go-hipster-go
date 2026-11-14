package work.samelling.hipstergo.lab;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.SizeF;
import java.util.LinkedHashMap;
import java.util.Map;
import android.widget.RemoteViews;

/** One responsive, idle widget. No network, polling, repeating animation or WebView. */
public final class ChaosRollWidgetProvider extends AppWidgetProvider {
    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) render(context,manager,id,manager.getAppWidgetOptions(id));
    }

    @Override public void onAppWidgetOptionsChanged(Context context, AppWidgetManager manager,
                                                     int id, Bundle options) {
        super.onAppWidgetOptionsChanged(context,manager,id,options);
        render(context,manager,id,options);
    }

    private int layoutId(String variant) {
        return "mini".equals(variant)
            ? R.layout.widget_chaos_roll_mini : R.layout.widget_chaos_roll_hero;
    }

    private void render(Context context, AppWidgetManager manager, int id, Bundle options) {
        if (Build.VERSION.SDK_INT >= 31 && options != null) {
            var sizes = options.<SizeF>getParcelableArrayList(AppWidgetManager.OPTION_APPWIDGET_SIZES);
            if (sizes != null && !sizes.isEmpty() && sizes.size() <= 16) {
                Map<SizeF, RemoteViews> layouts = new LinkedHashMap<>();
                for (SizeF size : sizes) {
                    // Use each actual width/height pair. Legacy minimums can come from
                    // different orientations and understate the available space.
                    boolean cassette = size.getWidth() >= 160 && size.getHeight() >= 104;
                    layouts.put(size, createViews(context, id, cassette ? "hero" : "mini"));
                }
                manager.updateAppWidget(id, new RemoteViews(layouts));
                return;
            }
        }
        int width = options == null ? 0 :
            options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH,0);
        int height = options == null ? 0 :
            options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT,0);
        manager.updateAppWidget(id, createViews(context, id, ChaosWidgetSizes.select(width, height)));
    }

    private RemoteViews createViews(Context context, int id, String variant) {
        RemoteViews views = new RemoteViews(context.getPackageName(),layoutId(variant));
        Intent roll = new Intent(context,ChaosRollActivity.class)
            .setAction("work.samelling.hipstergo.lab.CHAOS_ROLL");
        PendingIntent rollTap = PendingIntent.getActivity(context,id*2,roll,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        // The artwork is the primary roll action at every size.
        views.setOnClickPendingIntent(android.R.id.background,rollTap);

        if (!"mini".equals(variant)) {
            // Header is a separate 48dp app-opening target, on the cassette.
            Intent home = new Intent(context,LabActivity.class);
            PendingIntent homeTap = PendingIntent.getActivity(context,id*2+1,home,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.chaos_roll_open,homeTap);
        }
        return views;
    }
}
