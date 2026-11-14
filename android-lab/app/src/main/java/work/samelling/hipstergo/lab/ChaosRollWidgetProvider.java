package work.samelling.hipstergo.lab;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
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
        switch(variant) {
            case "mini": return R.layout.widget_chaos_roll_mini;
            case "tall2": return R.layout.widget_chaos_roll_tall2;
            case "tall3": return R.layout.widget_chaos_roll_tall3;
            case "wide": return R.layout.widget_chaos_roll_wide;
            case "hero": return R.layout.widget_chaos_roll_hero;
            default: return R.layout.widget_chaos_roll_square;
        }
    }

    private void render(Context context, AppWidgetManager manager, int id, Bundle options) {
        int width = options == null ? 0 :
            options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH,0);
        int height = options == null ? 0 :
            options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT,0);
        String variant = ChaosWidgetSizes.select(width,height);
        RemoteViews views = new RemoteViews(context.getPackageName(),layoutId(variant));
        Intent roll = new Intent(context,ChaosRollActivity.class)
            .setAction("work.samelling.hipstergo.lab.CHAOS_ROLL");
        PendingIntent rollTap = PendingIntent.getActivity(context,id*2,roll,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        // The full cassette is the primary, accessible action at every size.
        views.setOnClickPendingIntent(android.R.id.background,rollTap);

        if (!"mini".equals(variant)) {
            // Header is a separate 48dp app-opening target, except at 1x1.
            Intent home = new Intent(context,LabActivity.class);
            PendingIntent homeTap = PendingIntent.getActivity(context,id*2+1,home,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.chaos_roll_open,homeTap);
        }
        manager.updateAppWidget(id,views);
    }
}
