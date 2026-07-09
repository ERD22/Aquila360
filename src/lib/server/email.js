import { Resend } from 'resend';
import { RESEND_API_KEY, FROM_EMAIL, TEST_EMAIL, APP_ORIGIN } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);

export async function enviarCorreoCotizacion({ cotizacion, cliente }) {
	const fmt = (value) =>
		new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
			Number(value ?? 0)
		);

	const fmtFecha = (date) => {
		if (!date) return null;
		return new Date(date).toLocaleDateString('es-MX', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	};

	const conceptos = Array.isArray(cotizacion.conceptos) ? cotizacion.conceptos : [];

	const filasConceptos = conceptos
		.map(
			(c) => `
		<tr>
			<td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-size: 14px;">${c.descripcion}</td>
			<td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-size: 14px; text-align: center;">${Number(c.cantidad)}</td>
			<td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-size: 14px; text-align: right;">${fmt(c.precioUnitario)}</td>
			<td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-size: 14px; text-align: right;">${fmt(c.subtotal)}</td>
		</tr>`
		)
		.join('');

	const tablaConceptos =
		conceptos.length > 0
			? `
		<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 20px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
			<thead>
				<tr style="background: #f9fafb;">
					<th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Descripción</th>
					<th style="padding: 10px 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Cant.</th>
					<th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Precio unit.</th>
					<th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Subtotal</th>
				</tr>
			</thead>
			<tbody>${filasConceptos}</tbody>
		</table>`
			: '';

	const subtotal = Number(cotizacion.subtotal ?? 0);
	const iva = Number(cotizacion.iva ?? 0);
	const total = Number(cotizacion.total ?? 0);

	const bloqueVencimiento = cotizacion.vencimiento
		? `<p style="font-size: 13px; color: #6b7280; margin: 0 0 16px;">
				Vigencia hasta: <strong>${fmtFecha(cotizacion.vencimiento)}</strong>
			</p>`
		: '';

	const urlCotizacion = `${APP_ORIGIN}/cotizaciones/${cotizacion.id}`;

	const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6;">
	<tr>
		<td align="center" style="padding: 32px 16px;">
			<table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; font-family: Arial, sans-serif;">

				<!-- HEADER -->
				<tr>
					<td style="background: #111827; padding: 24px 28px; border-radius: 12px 12px 0 0;">
						<p style="margin: 0; color: #ffffff; font-size: 22px; font-weight: bold;">Aquila360</p>
					</td>
				</tr>

				<!-- BODY -->
				<tr>
					<td style="background: #ffffff; padding: 28px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
						<p style="font-size: 16px; color: #1f2937; margin: 0 0 8px;">Hola <strong>${cliente.nombre}</strong>,</p>
						<p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 20px;">
							Es un gusto saludarte. Hemos preparado tu cotización
							<strong>${cotizacion.numero}</strong> y con gusto te la compartimos.
						</p>

						${bloqueVencimiento}

						${tablaConceptos}

						<!-- TOTALES -->
						<table width="100%" cellpadding="0" cellspacing="0" style="margin: 4px 0 24px;">
							<tr>
								<td width="60%"></td>
								<td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Subtotal</td>
								<td style="padding: 6px 0; font-size: 14px; color: #1f2937; text-align: right;">${fmt(subtotal)}</td>
							</tr>
							<tr>
								<td width="60%"></td>
								<td style="padding: 6px 0; font-size: 14px; color: #6b7280;">IVA (16%)</td>
								<td style="padding: 6px 0; font-size: 14px; color: #1f2937; text-align: right;">${fmt(iva)}</td>
							</tr>
							<tr>
								<td width="60%"></td>
								<td style="padding: 10px 0 6px; font-size: 16px; font-weight: bold; color: #111827; border-top: 2px solid #e5e7eb;">Total</td>
								<td style="padding: 10px 0 6px; font-size: 16px; font-weight: bold; color: #111827; text-align: right; border-top: 2px solid #e5e7eb;">${fmt(total)}</td>
							</tr>
						</table>

						<!-- CTA -->
						<table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
							<tr>
								<td align="center">
									<a href="${urlCotizacion}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 14px 32px; border-radius: 8px;">
										Ver cotización
									</a>
								</td>
							</tr>
						</table>

						<p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 20px;">
							Quedamos atentos a cualquier duda o comentario. Será un placer acompañarte en este proyecto.
						</p>
						<p style="font-size: 14px; color: #374151; margin: 0;">
							Saludos cordiales,<br /><strong>El equipo de Aquila360</strong>
						</p>
					</td>
				</tr>

				<!-- FOOTER -->
				<tr>
					<td style="background: #f9fafb; padding: 20px 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
						<p style="margin: 0; font-size: 12px; color: #9ca3af;">
							Aquila360 &middot; Chihuahua, México &middot;
							<a href="mailto:contacto@aquila360.mx" style="color: #9ca3af;">contacto@aquila360.mx</a>
						</p>
						<p style="margin: 6px 0 0; font-size: 12px; color: #d1d5db;">
							Este correo fue enviado automáticamente. Si tienes dudas, contáctanos directamente.
						</p>
					</td>
				</tr>

			</table>
		</td>
	</tr>
</table>
</body>
</html>
	`;

	// MVP: sin dominio verificado, Resend solo permite enviar a tu correo de cuenta.
	// En producción (con dominio verificado) sería: to: cliente.correo
	const destinatario = TEST_EMAIL;

	const { data, error } = await resend.emails.send({
		from: `Aquila360 <${FROM_EMAIL}>`,
		to: destinatario,
		subject: `Tu cotización ${cotizacion.numero} está lista`,
		html
	});

	if (error) {
		console.error('Error al enviar el correo de cotización:', error);
		return { ok: false, error };
	}

	return { ok: true, data };
}
